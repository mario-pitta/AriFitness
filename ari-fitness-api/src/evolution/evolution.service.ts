import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { DataBaseService } from "../datasource/database.service";

@Injectable()
export class EvolutionService {
    private readonly logger = new Logger(EvolutionService.name);
    private readonly baseUrl: string;
    private readonly globalApiKey: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly databaseService: DataBaseService
    ) {
        this.baseUrl = this.configService.get<string>('EVOLUTION_API_URL') as string;
        this.globalApiKey = this.configService.get<string>('EVOLUTION_API_KEY') as string;
    }

    /**
     * Cria uma nova instância na Evolution Go para uma empresa específica.
     * O nome da instância será o UUID da empresa.
     * 
     * @param empresaId UUID da empresa
     * @returns Resposta da Evolution API
     */
    async createInstance(empresaId: string) {

        console.log('this.baseUrl = ', this.baseUrl)
        console.log('this.globalApiKey = ', this.globalApiKey)
        try {
            const response = await axios.post(`${this.baseUrl}/instance/create`, {
                name: empresaId,
                token: empresaId,

            }, {
                headers: {
                    'apikey': this.globalApiKey,
                    'Content-Type': 'application/json'
                }
            });


            const token = response.data.token;


            // Salva ou atualiza o registro de integração no Supabase
            await this.databaseService.supabase
                .from('integracao_whatsapp')
                .upsert({
                    empresa_id: empresaId,
                    instancia_token: token,
                    fl_ativo: true
                }, { onConflict: 'empresa_id' });

            return response.data;
        } catch (error) {
            const errorData = error.response?.data;
            this.logger.error(`Erro ao criar instância para empresa ${empresaId}: ${error.message}`, errorData ? JSON.stringify(errorData) : '');
            throw error;
        }
    }

    /**
     * Recupera o QR Code (Base64) para conexão da instância.
     * 
     * @returns Resposta contendo o QR Code
     */
    async getQRCode(empresa_id: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/instance/qr`, {
                headers: {
                    'apikey': empresa_id
                }
            });
            return response.data;
        } catch (error) {
            this.logger.error(`Erro ao buscar QR Code: ${error.message}`);
            throw error;
        }
    }

    /**
     * Verifica o status de conexão da instância.
     * 
     * @returns Status da instância
     */
    async getStatus(empresaId: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/instance/status`, {
                headers: {
                    'apikey': empresaId
                }
            });
            return response.data;
        } catch (error) {
            this.logger.error(`Erro ao buscar status: ${error.message}`);
            throw error;
        }
    }

    /**
     * Envia uma mensagem buscando o WhatsApp do aluno no banco de dados.
     * 
     * @param empresaId ID da empresa (nome da instância)
     * @param usuarioId ID do usuário de destino
     * @param text Conteúdo da mensagem
     */
    async sendMessageByUserId(empresaId: string, usuarioId: string, text: string) {
        try {
            // 1. Buscar dados do aluno no Supabase
            const { data: usuario, error: dbError } = await this.databaseService.supabase
                .from('usuario')
                .select('whatsapp')
                .eq('id', usuarioId)
                .single();

            if (dbError || !usuario?.whatsapp) {
                this.logger.warn(`WhatsApp não encontrado ou erro de banco para o usuário ${usuarioId}`);
                throw new Error('Número de WhatsApp não encontrado para este aluno.');
            }

            // 2. Formatar número (garantir padrão internacional se necessário - a API Evolution Go geralmente cuida disso, mas validamos)
            let formattedNumber = usuario.whatsapp.replace(/\D/g, '');
            // Se não tiver o DDI (55), adicionamos para garantir (regra baseada no projeto BR)
            if (formattedNumber.length === 11 || formattedNumber.length === 10) {
                formattedNumber = '55' + formattedNumber;
            }


            console.log('formattedNumber = ', formattedNumber)
            // 3. Disparar o envio
            return await this.sendMessage(empresaId, formattedNumber, text);
        } catch (error) {
            this.logger.error(`Falha no fluxo de envio para o usuário ${usuarioId}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Envia uma mensagem de texto via Evolution Go.
     * 
     * @param empresaId ID da empresa (nome da instância)
     * @param number Número de destino (com DDI e DDD)
     * @param text Conteúdo da mensagem
     */
    async sendMessage(empresaId: string, number: string, text: string) {
        try {
            const response = await axios.post(`${this.baseUrl}/send/text`, {
                // id: empresaId,
                number: number,
                text: text
            }, {
                headers: {
                    'apikey': empresaId,
                    'Content-Type': 'application/json'
                }
            });


            console.log('response.data = ', response.data)

            return response.data;
        } catch (error) {
            this.logger.error(`Erro ao enviar mensagem para ${number}: ${error.message}`);
            throw error;
        }
    }

    /**
     * Desconecta a instância da Evolution Go.
     * 
     * @param empresaId ID da empresa (nome da instância)
     */
    async disconnect(empresaId: string) {
        try {
            const response = await axios.post(`${this.baseUrl}/instance/disconnect`, {
                id: empresaId
            }, {
                headers: {
                    'apikey': this.globalApiKey,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            this.logger.error(`Erro ao desconectar instância ${empresaId}: ${error.message}`);
            throw error;
        }
    }
}
