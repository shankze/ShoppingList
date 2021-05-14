import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {ActivatedRoute,Router} from '@angular/router'
import {ErrorStateMatcher} from '@angular/material/core';
import { Subscription } from 'rxjs';
import { ListsService } from '../services/lists.service';

@Component({
  selector: 'app-list-share',
  templateUrl: './list-share.component.html',
  styleUrls: ['./list-share.component.css']
})
export class ListShareComponent implements OnInit {
  listId:string;
  sub!: Subscription;
  errorMessage:string;
  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);


  constructor(private router:Router, private activatedRoute:ActivatedRoute,private listService:ListsService) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams
    .subscribe(params => {
      console.log(params);
      this.listId = params.listId;
    })
  }

  back(){
    this.router.navigate(['/list'],{queryParams:{listId:this.listId}});
  }

  shareList(){
    console.log(this.emailFormControl.value)
    this.sub = this.listService.shareList(this.emailFormControl.value,this.listId).subscribe({
      next: result => {  
        console.log(result)
        if(result.status === true){
          this.router.navigate(['/list'],{queryParams:{listId:this.listId}});
        }else{
          this.errorMessage = result['message']
        }
      },
      error: err => this.errorMessage = "There was an error"
    })
  }

}
