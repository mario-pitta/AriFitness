import Constants from '../Constants';

export interface NavigationItem {
    label: string;
    sidebarIcon: string;
    tabIcon?: string;
    route: string;
    roles?: (string | number)[]; // Allowed tipo_usuario
    functionIds?: number[]; // Allowed function_id
    showInSidebar: boolean;
    showInMobile: boolean;
    group?: 'Principal' | 'Gestão' | 'Operacional' | 'Sistema' | 'Aluno';
    adminOnly?: boolean; // Shortcut for GERENCIA_ID
}

export const NAV_ITEMS: NavigationItem[] = [
    // --- ADMIN / INSTRUTOR ---
    {
        label: 'Painel Geral',
        sidebarIcon: 'grid-outline',
        tabIcon: 'home',
        route: '/admin/dashboard',
        roles: [Constants.GERENCIA_ID],
        functionIds: [Constants.INSTRUTOR_ID],
        showInSidebar: true,
        showInMobile: true,
        group: 'Principal',
        adminOnly: true
    },
    {
        label: 'Alunos',
        sidebarIcon: 'people-outline',
        tabIcon: 'people',
        route: '/admin/membros',
        roles: [Constants.GERENCIA_ID],
        functionIds: [Constants.INSTRUTOR_ID],
        showInSidebar: true,
        showInMobile: true,
        group: 'Gestão',
    },
    {
        label: 'Equipe',
        sidebarIcon: 'id-card-outline',
        route: '/admin/equipe',
        roles: [Constants.GERENCIA_ID],
        showInSidebar: true,
        showInMobile: true,
        group: 'Gestão',
        adminOnly: true
    },
    {
        label: 'Finanças',
        sidebarIcon: 'wallet-outline',
        tabIcon: 'cash',
        route: '/admin/financas',
        roles: [Constants.GERENCIA_ID],
        showInSidebar: true,
        showInMobile: true,
        group: 'Gestão',
        adminOnly: true,
    },
    {
        label: 'Ponto de Venda',
        sidebarIcon: 'pos-outline',
        route: '/admin/pdv',
        roles: [Constants.GERENCIA_ID],
        showInSidebar: true,
        showInMobile: true,
        group: 'Gestão',
        adminOnly: true
    },
    {
        label: 'Fichas / Treinos',
        sidebarIcon: 'clipboard-outline',
        route: '/admin/treinos',
        roles: [Constants.GERENCIA_ID],
        functionIds: [Constants.GERENCIA_ID, Constants.INSTRUTOR_ID],
        showInSidebar: true,
        showInMobile: false,
        group: 'Gestão',
    },
    {
        label: 'Check-in',
        sidebarIcon: 'qr-code-outline',
        route: '/admin/qrcode',
        roles: [Constants.GERENCIA_ID],
        functionIds: [Constants.GERENCIA_ID, Constants.INSTRUTOR_ID],
        showInSidebar: true,
        showInMobile: true,
        group: 'Operacional',
    },
    {
        label: 'Tarefas',
        sidebarIcon: 'list-outline',
        route: '/admin/tarefas',
        roles: [Constants.GERENCIA_ID],
        functionIds: [Constants.GERENCIA_ID, Constants.INSTRUTOR_ID],
        showInSidebar: true,
        showInMobile: true,
        group: 'Operacional',
    },
    {
        label: 'Calendário',
        sidebarIcon: 'calendar-outline',
        tabIcon: 'calendar',
        route: '/admin/calendario',
        roles: [Constants.GERENCIA_ID],
        functionIds: [Constants.GERENCIA_ID, Constants.INSTRUTOR_ID],
        showInSidebar: true,
        showInMobile: true,
        group: 'Operacional',
    },
    {
        label: 'Contatos',
        sidebarIcon: 'call-outline',
        route: '/admin/contatos',
        roles: [Constants.GERENCIA_ID],
        showInSidebar: true,
        showInMobile: true,
        group: 'Operacional',
    },
    {
        label: 'Equipamentos',
        sidebarIcon: 'bicycle-outline',
        route: '/admin/equipamentos',
        roles: [Constants.GERENCIA_ID],
        showInSidebar: true,
        showInMobile: false,
        group: 'Operacional',
    },
    {
        label: 'Minha Loja',
        sidebarIcon: 'storefront-outline',
        route: '/admin/configuracoes/ecommerce/produtos',
        roles: [Constants.GERENCIA_ID],
        showInSidebar: true,
        showInMobile: true,
        group: 'Operacional',
        adminOnly: true
    },
    {
        label: 'Exercícios',
        sidebarIcon: 'barbell-outline',
        route: '/admin/exercicios',
        roles: [Constants.GERENCIA_ID],
        showInSidebar: true,
        showInMobile: false,
        group: 'Operacional',
    },
    {
        label: 'Configurações',
        sidebarIcon: 'settings-outline',
        tabIcon: 'settings',
        route: '/admin/configuracoes',
        roles: [Constants.GERENCIA_ID],
        functionIds: [Constants.INSTRUTOR_ID],
        showInSidebar: true,
        showInMobile: false,
        group: 'Sistema',
    },

    // --- ALUNO ---
    {
        label: 'Home',
        sidebarIcon: 'home',
        tabIcon: 'home',
        route: '/home',
        roles: [Constants.ALUNO_ID],
        showInSidebar: false,
        showInMobile: true,
        group: 'Aluno',
    },
    {
        label: 'Treinar',
        sidebarIcon: 'barbell-outline',
        tabIcon: 'barbell-outline',
        route: '/treinar',
        roles: [Constants.ALUNO_ID],
        showInSidebar: false,
        showInMobile: true,
        group: 'Aluno',
    },
    {
        label: 'Estatísticas',
        sidebarIcon: 'stats-chart-outline',
        tabIcon: 'stats-chart-outline',
        route: '/stats',
        roles: [Constants.ALUNO_ID],
        showInSidebar: false,
        showInMobile: true,
        group: 'Aluno',
    },
    {
        label: 'Perfil',
        sidebarIcon: 'person',
        tabIcon: 'person',
        route: '/cadastro-usuario',
        roles: [Constants.ALUNO_ID],
        showInSidebar: false,
        showInMobile: true,
        group: 'Aluno',
    },
];

export function canSeeItem(user: any, item: NavigationItem): boolean {
    if (!user) return false;

    // Admin bypass
    if (item.adminOnly && user.tipo_usuario !== Constants.GERENCIA_ID && user.function_id !== Constants.GERENCIA_ID && user.funcao?.id !== Constants.GERENCIA_ID) {
        return false;
    }

    const roleMatch = item.roles ? item.roles.includes(user.tipo_usuario || user.function_id || user.funcao?.id) : true;
    const functionMatch = item.functionIds ? item.functionIds.includes(user.tipo_usuario || user.function_id || user.funcao?.id) : false;

    return roleMatch || functionMatch;
}
