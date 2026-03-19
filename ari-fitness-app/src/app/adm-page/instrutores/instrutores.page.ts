import Constants from 'src/core/Constants';
import { UsuarioService } from './../../../core/services/usuario/usuario.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/core/services/auth/auth.service';
import { Usuario } from 'src/core/models/Usuario';
import { Router } from '@angular/router';
import { TeamMemberService } from 'src/core/services/instructor/team-member.service';

@Component({
  selector: 'app-instrutores',
  templateUrl: './instrutores.page.html',
  styleUrls: ['./instrutores.page.scss'],
})
export class InstrutoresPage implements OnInit {
  instrutores: any[] = [];
  filteredInstrutores: any[] = [];
  carregando = false;

  searchTerm = '';
  statusFilter = '';
  roleFilter = '';
  specialtyFilter = '';

  // Options for filters
  availableRoles: string[] = [];
  availableSpecialties: string[] = [];

  // Grouped data
  groupedInstrutores: { role: string, members: any[] }[] = [];

  // Mocked Analytics Data
  roleDistribution: any[] = [];
  workloadData: any[] = [];
  specialtyData: any[] = [];

  colorScheme: any = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5']
  };

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private teamMemberService: TeamMemberService
  ) { }

  ngOnInit() {
    this.getInstrutores(this.auth.getUser.empresa_id as string);
  }

  ionViewWillEnter() {
    this.getInstrutores(this.auth.getUser.empresa_id as string);
  }

  getInstrutores(empresaId: string) {
    this.carregando = true;

    this.teamMemberService.findAll(empresaId).subscribe({
      next: (members) => {
        this.instrutores = members.map((member: any) => {
          return {
            ...member,
            id: member.id,
            nome: member.nome,
            role: member.tipo_usuario?.nome || 'Membro',
            specialties: member.specialties?.map((s: any) => s.nome) || [],
            status: member.status,
            foto_url: member.foto_url,
            genero: member.genero || 'M'
          };
        });

        // Extract unique roles and specialties for filters
        this.availableRoles = [...new Set(this.instrutores.map(i => i.role))].sort();
        const allSpecs: string[] = this.instrutores.reduce((acc: string[], i) => [...acc, ...i.specialties], []);
        this.availableSpecialties = [...new Set(allSpecs)].sort();

        this.applyFilters();
        this.generateMockAnalytics();
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
      }
    });
  }

  generateMockAnalytics() {
    // Role Distribution (Pie)
    const roleCounts = this.instrutores.reduce((acc: any, i) => {
      acc[i.role] = (acc[i.role] || 0) + 1;
      return acc;
    }, {});
    this.roleDistribution = Object.keys(roleCounts).map(role => ({
      name: role,
      value: roleCounts[role]
    }));

    // Mock Workload (Bar) - members per day avg
    this.workloadData = this.availableRoles.map(role => ({
      name: role,
      value: Math.floor(Math.random() * 20) + 5
    }));

    // Specialty Coverage
    this.specialtyData = this.availableSpecialties.slice(0, 5).map(spec => ({
      name: spec,
      value: this.instrutores.filter(i => i.specialties.includes(spec)).length
    }));
  }

  applyFilters() {
    let list = [...this.instrutores];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      list = list.filter(i =>
        i.nome?.toLowerCase().includes(term) ||
        i.whatsapp?.includes(term) ||
        i.cpf?.includes(term)
      );
    }

    if (this.statusFilter) {
      list = list.filter(i => i.status === this.statusFilter);
    }

    if (this.roleFilter) {
      list = list.filter(i => i.role === this.roleFilter);
    }

    if (this.specialtyFilter) {
      list = list.filter(i => i.specialties.includes(this.specialtyFilter));
    }

    this.filteredInstrutores = list;

    // Grouping logic
    const groups = list.reduce((acc: any, member) => {
      const role = member.role;
      if (!acc[role]) acc[role] = [];
      acc[role].push(member);
      return acc;
    }, {});

    this.groupedInstrutores = Object.keys(groups).map(role => ({
      role,
      members: groups[role]
    })).sort((a, b) => a.role.localeCompare(b.role));
  }

  getDefaultAvatar(genero: string): string {
    return genero === 'F'
      ? 'https://images.pexels.com/photos/13197535/pexels-photo-13197535.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1'
      : 'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?q=80&w=400&auto=format&fit=crop';
  }

  openForm(id: string) {
    this.router.navigate(['/admin/equipe/formulario'], { queryParams: { memberId: id } });
  }
}
