import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {SignupInfo} from '../objects'
import { AuthorizationService } from '../services/authorization.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  userName: string;
  password1: string;
  password2: string;
  alertText: string;
  pageContainsAlert: boolean = false;

  constructor(private authService: AuthorizationService, private router: Router) { }

  ngOnInit(): void {
  }

  processSignup(){
    if(this.password1 !== this.password2){
      this.pageContainsAlert = true;
      this.alertText = "Passwords do not match"
      console.log('Passwords do not match')
      return;
    }
    let signupInfo: SignupInfo = {
      userName:this.userName,
      password: this.password1
    }

    this.authService.signup(signupInfo).subscribe({
      next: (results) => this.onSaveComplete(results),
      error: (err) => console.log(err),
    })
    
  }

  onSaveComplete(result): void {
    console.log('============Result:===========');
    console.log(result.message);
    this.router.navigate(['/login']);
    //this.playersForm.reset();
    //this.router.navigate(["/codes"]);
    //this.router.navigate(["/game/" + resGame.adminGameId]);
  }

}
