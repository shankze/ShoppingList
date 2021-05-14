import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthorizationService } from './services/authorization.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'angular-security-route-guard';
  //isLoggedIn:boolean = true;

  constructor(private authService: AuthorizationService,private router: Router) { }

  get isLoggedIn():boolean{
    return this.authService.isLoggedIn;
  }

  get userName():string{
    if(this.authService.currentUser){
      return this.authService.currentUser;
    }
    return '';
  }

  logOut():void{
    //this.authService.logout();
    this.authService.logout().subscribe({
      next: (results) => this.onSaveComplete(),
      error: (err) => console.log(err),
    })
    
  }

  onSaveComplete(): void {
    this.router.navigateByUrl('/login');
  }


  ngOnInit(): void {
    //this.isLoggedIn = this.authService.isLoggedIn
  }

}
