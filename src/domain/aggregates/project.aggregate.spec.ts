import { ProjectAggregate, ProjectMemberRole } from './project.aggregate';

describe('ProjectAggregate', () => {
  let project: ProjectAggregate;
  const projectId = 'project-123';
  const ownerId = 'user-owner';

  beforeEach(() => {
    project = new ProjectAggregate(
      projectId,
      'Test Project',
      'Test Description',
      ownerId,
    );
  });

  describe('Project Creation', () => {
    it('should create project with correct initial values', () => {
      expect(project.id).toBe(projectId);
      expect(project.name).toBe('Test Project');
      expect(project.description).toBe('Test Description');
      expect(project.ownerId).toBe(ownerId);
      expect(project.isActive).toBe(true);
    });

    it('should automatically add owner as member', () => {
      const members = project.members;
      expect(members).toHaveLength(1);
      expect(members[0].userId).toBe(ownerId);
      expect(members[0].role).toBe(ProjectMemberRole.OWNER);
    });
  });

  describe('Member Management', () => {
    const memberId = 'user-member';
    const adminId = 'user-admin';

    beforeEach(() => {
      // Add an admin for testing member management
      project.addMember(adminId, ProjectMemberRole.ADMIN, ownerId);
    });

    it('should add member to project', () => {
      project.addMember(memberId, ProjectMemberRole.MEMBER, ownerId);

      expect(project.isMember(memberId)).toBe(true);
      expect(project.getMemberRole(memberId)).toBe(ProjectMemberRole.MEMBER);
    });

    it('should throw error when adding existing member', () => {
      project.addMember(memberId, ProjectMemberRole.MEMBER, ownerId);

      expect(() => {
        project.addMember(memberId, ProjectMemberRole.VIEWER, ownerId);
      }).toThrow('User is already a member of this project');
    });

    it('should throw error when non-manager tries to add member', () => {
      const viewerId = 'user-viewer';
      project.addMember(viewerId, ProjectMemberRole.VIEWER, ownerId);

      expect(() => {
        project.addMember(memberId, ProjectMemberRole.MEMBER, viewerId);
      }).toThrow('Insufficient permissions to add members');
    });

    it('should remove member from project', () => {
      project.addMember(memberId, ProjectMemberRole.MEMBER, ownerId);
      expect(project.isMember(memberId)).toBe(true);

      project.removeMember(memberId, ownerId);

      expect(project.isMember(memberId)).toBe(false);
    });

    it('should not allow removing project owner', () => {
      expect(() => {
        project.removeMember(ownerId, ownerId);
      }).toThrow('Cannot remove project owner');
    });

    it('should throw error when removing non-member', () => {
      expect(() => {
        project.removeMember('non-member', ownerId);
      }).toThrow('User is not a member of this project');
    });

    it('should update member role', () => {
      project.addMember(memberId, ProjectMemberRole.MEMBER, ownerId);

      project.updateMemberRole(memberId, ProjectMemberRole.ADMIN, ownerId);

      expect(project.getMemberRole(memberId)).toBe(ProjectMemberRole.ADMIN);
    });

    it('should not allow changing owner role', () => {
      expect(() => {
        project.updateMemberRole(ownerId, ProjectMemberRole.ADMIN, ownerId);
      }).toThrow('Cannot change owner role');
    });
  });

  describe('Permission System', () => {
    const adminId = 'user-admin';
    const memberId = 'user-member';
    const viewerId = 'user-viewer';

    beforeEach(() => {
      project.addMember(adminId, ProjectMemberRole.ADMIN, ownerId);
      project.addMember(memberId, ProjectMemberRole.MEMBER, ownerId);
      project.addMember(viewerId, ProjectMemberRole.VIEWER, ownerId);
    });

    describe('Project Management Permissions', () => {
      it('should allow owner to manage project', () => {
        expect(project.canManageProject(ownerId)).toBe(true);
      });

      it('should allow admin to manage project', () => {
        expect(project.canManageProject(adminId)).toBe(true);
      });

      it('should not allow member to manage project', () => {
        expect(project.canManageProject(memberId)).toBe(false);
      });

      it('should not allow viewer to manage project', () => {
        expect(project.canManageProject(viewerId)).toBe(false);
      });
    });

    describe('Member Management Permissions', () => {
      it('should allow owner to manage members', () => {
        expect(project.canManageMembers(ownerId)).toBe(true);
      });

      it('should allow admin to manage members', () => {
        expect(project.canManageMembers(adminId)).toBe(true);
      });

      it('should not allow member to manage members', () => {
        expect(project.canManageMembers(memberId)).toBe(false);
      });
    });

    describe('Task Creation Permissions', () => {
      it('should allow owner to create tasks', () => {
        expect(project.canCreateTasks(ownerId)).toBe(true);
      });

      it('should allow admin to create tasks', () => {
        expect(project.canCreateTasks(adminId)).toBe(true);
      });

      it('should allow member to create tasks', () => {
        expect(project.canCreateTasks(memberId)).toBe(true);
      });

      it('should not allow viewer to create tasks', () => {
        expect(project.canCreateTasks(viewerId)).toBe(false);
      });

      it('should not allow non-member to create tasks', () => {
        expect(project.canCreateTasks('non-member')).toBe(false);
      });
    });

    describe('View Permissions', () => {
      it('should allow all members to view project', () => {
        expect(project.canViewProject(ownerId)).toBe(true);
        expect(project.canViewProject(adminId)).toBe(true);
        expect(project.canViewProject(memberId)).toBe(true);
        expect(project.canViewProject(viewerId)).toBe(true);
      });

      it('should not allow non-member to view project', () => {
        expect(project.canViewProject('non-member')).toBe(false);
      });
    });
  });

  describe('Project Status Management', () => {
    it('should deactivate project', () => {
      project.deactivate(ownerId);

      expect(project.isActive).toBe(false);
    });

    it('should activate project', () => {
      project.deactivate(ownerId);
      project.activate(ownerId);

      expect(project.isActive).toBe(true);
    });

    it('should throw error when non-manager tries to deactivate', () => {
      const memberId = 'user-member';
      project.addMember(memberId, ProjectMemberRole.MEMBER, ownerId);

      expect(() => {
        project.deactivate(memberId);
      }).toThrow('Insufficient permissions to deactivate project');
    });
  });

  describe('Project Details Update', () => {
    it('should update project details', () => {
      const newName = 'Updated Project';
      const newDescription = 'Updated Description';

      project.updateDetails(newName, newDescription, ownerId);

      expect(project.name).toBe(newName);
      expect(project.description).toBe(newDescription);
    });

    it('should throw error when non-manager tries to update', () => {
      const memberId = 'user-member';
      project.addMember(memberId, ProjectMemberRole.MEMBER, ownerId);

      expect(() => {
        project.updateDetails('New Name', 'New Description', memberId);
      }).toThrow('Insufficient permissions to update project');
    });
  });

  describe('Domain Events Management', () => {
    it('should clear domain events', () => {
      project.clearDomainEvents();

      expect(project.domainEvents).toHaveLength(0);
    });

    it('should return copy of domain events', () => {
      const events = project.domainEvents;
      events.push({} as any); // Try to modify returned array

      expect(project.domainEvents.length).toBe(0); // Original should be unchanged
    });
  });
});