import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface RealtimeEvent {
    table: string;
    action: 'INSERT' | 'UPDATE' | 'DELETE';
    payload: any;
}

@Injectable({
    providedIn: 'root'
})
export class SupabaseRealtimeManagerService {
    private isLeader = false;
    private channel: BroadcastChannel;
    private supabase: SupabaseClient | null = null;
    private realtimeChannel: any = null;

    // RxJS subjects for UI to listen
    public onPedidoChanged = new Subject<RealtimeEvent>();
    public onProdutoChanged = new Subject<RealtimeEvent>();

    // Heartbeat properties
    private heartbeatInterval: any;
    private followerTimeout: any;

    private HEARBEAT_INTERVAL_MS = 2000;
    private TIMEOUT_MS = 4000;

    constructor(private http: HttpClient, private ngZone: NgZone) {
        this.channel = new BroadcastChannel('ari_fitness_realtime');
        this.channel.onmessage = this.handleBroadcastMessage.bind(this);
    }

    /**
     * Inicializa o manager (chamado logo apos o login de administrador).
     */
    async initialize() {
        this.startElection();
    }

    private async tryBecomeLeader() {
        this.isLeader = true;
        console.log('[RealtimeManager] Sou o NOVO LÍDER! Conectando ao Websocket...');

        // Comunica para as outras abas que agora este é o lider
        this.broadcastHeartbeat();
        this.heartbeatInterval = setInterval(() => this.broadcastHeartbeat(), this.HEARBEAT_INTERVAL_MS);

        await this.connectToSupabase();
    }

    private startElection() {
        // Escuta o pulso. Se não receber nos próximos 4 segundos, assume a liderança.
        this.resetFollowerTimeout();

        // Uma tentativa rápida inicial, caso não tenha ping logo
        setTimeout(() => {
            if (!this.isLeader) {
                // Ping para ver se alguém responde
                this.channel.postMessage({ type: 'PING' });
            }
        }, 500);
    }

    private resetFollowerTimeout() {
        if (this.followerTimeout) clearTimeout(this.followerTimeout);

        this.followerTimeout = setTimeout(() => {
            if (!this.isLeader) {
                console.warn('[RealtimeManager] Líder sumiu. Assumindo a liderança...');
                this.tryBecomeLeader();
            }
        }, this.TIMEOUT_MS);
    }

    private broadcastHeartbeat() {
        if (!this.isLeader) return;
        this.channel.postMessage({ type: 'HEARTBEAT' });
    }

    private handleBroadcastMessage(event: MessageEvent) {
        const data = event.data;

        // Se receber um HEARTBEAT e e for um seguidor, sei que o master tá vivo.
        if (data.type === 'HEARTBEAT') {
            if (this.isLeader) {
                // Conflito de líderes: a aba que estiver mais tempo ativa fica, ou cede.
                // Simulando ceder caso o PING de outra que tenha um tempo maior chegue (na v2).
                // Por simplicidade: não sou o líder se outro cara deu ping!
                console.log('[RealtimeManager] Conflito resolvido, cedendo liderança...');
                this.demoteToFollower();
            } else {
                this.resetFollowerTimeout();
            }
        } else if (data.type === 'PING') {
            if (this.isLeader) {
                this.broadcastHeartbeat(); // Confirma que tá vivo imediatamente
            }
        } else if (data.type === 'DB_EVENT') {
            // Recebeu um evento repassado pela Aba Lider!
            this.ngZone.run(() => {
                this.dispatchDbEvent(data.event);
            });
        }
    }

    private demoteToFollower() {
        this.isLeader = false;
        clearInterval(this.heartbeatInterval);
        this.disconnectSupabase();
        this.resetFollowerTimeout();
    }

    private async connectToSupabase() {
        try {
            // Instancia cliente padrão (Anônimo ou rely on global headers if we had interceptors working correctly)
            this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

            // Tenta abrir o canal de escuta.
            this.realtimeChannel = this.supabase.channel('admin_realtime')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos' }, (payload) => this.handleDbChanges('pedidos', payload))
                .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, (payload) => this.handleDbChanges('produtos', payload))
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('[RealtimeManager] Conectado ao Supabase Realtime.');
                    }
                });

        } catch (error) {
            console.error('[RealtimeManager] Falha ao conectar no Supabase.', error);
        }
    }

    private disconnectSupabase() {
        if (this.supabase && this.realtimeChannel) {
            this.supabase.removeChannel(this.realtimeChannel);
            this.realtimeChannel = null;
            console.log('[RealtimeManager] Desconectado do Realtime.');
        }
    }

    private handleDbChanges(table: string, payload: any) {
        const ev: RealtimeEvent = {
            table,
            action: payload.eventType,
            payload: payload.new
        };

        // Compartilha para as abas localmente no navegador!
        this.channel.postMessage({ type: 'DB_EVENT', event: ev });

        // E avisa a própria aba
        this.ngZone.run(() => {
            this.dispatchDbEvent(ev);
        });
    }

    private dispatchDbEvent(ev: RealtimeEvent) {
        if (ev.table === 'pedidos') {
            this.onPedidoChanged.next(ev);
        } else if (ev.table === 'produtos') {
            this.onProdutoChanged.next(ev);
        }
    }

    public destroy() {
        this.demoteToFollower();
        if (this.followerTimeout) clearTimeout(this.followerTimeout);
        this.channel.close();
    }
}
