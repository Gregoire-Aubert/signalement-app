import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Permissions, User } from '../model/AuthUser';
import { AuthenticationService } from '../services/authentication.service';

@Directive({
  selector: '[appPermission]',
})
export class AppPermissionDirective implements OnInit {

  @Input() appPermission: Permissions;
  @Input() appPermissionElse: TemplateRef<any>;

  constructor(private authenticationService: AuthenticationService,
              private viewContainer: ViewContainerRef,
              private templateRef: TemplateRef<any>) { }


  ngOnInit() {
    this.authenticationService.user.subscribe(
      user => {
        if (this.templateRef && this.hasPermission(user, this.appPermission)) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        } else if (this.appPermissionElse) {
          this.viewContainer.createEmbeddedView(this.appPermissionElse);
        } else {
          this.templateRef = null;
        }
      }
    );
  }

  hasPermission(user: User, permission: Permissions) {
    return user && user.permissions && user.permissions.indexOf(permission) !== -1;
  }
}

