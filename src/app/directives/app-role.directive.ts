import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Roles, User } from '../model/AuthUser';
import { AuthenticationService } from '../services/authentication.service';

@Directive({
  selector: '[appRole]',
})
export class AppRoleDirective implements OnInit {

  @Input() appRole: Roles[];
  @Input() appRoleElse: TemplateRef<any>;

  constructor(private authenticationService: AuthenticationService,
              private viewContainer: ViewContainerRef,
              private templateRef: TemplateRef<any>) { }


  ngOnInit() {
    this.authenticationService.user.subscribe(
      user => {
        if (this.templateRef && this.hasRole(user, this.appRole)) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else if (this.appRoleElse) {
          this.viewContainer.createEmbeddedView(this.appRoleElse);
        } else {
          this.templateRef = null;
        }
      }
    );
  }

  hasRole(user: User, roles: Roles[]) {
    return user && roles.find(role => role.toString() === user.role);
  }

}
