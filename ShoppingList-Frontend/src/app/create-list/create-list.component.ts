import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ListsService } from '../services/lists.service';

@Component({
  selector: 'app-create-list',
  templateUrl: './create-list.component.html',
  styleUrls: ['./create-list.component.css']
})
export class CreateListComponent implements OnInit {
  listName:string="";
  sub!: Subscription;
  errorMessage:string;

  constructor(private listService:ListsService, private router:Router) { }

  ngOnInit(): void {
  }

  createList(){
    this.sub = this.listService.createList(this.listName).subscribe({
      next: result => {  
        console.log(result)
        if(result.status === true){
          console.log('From Response:',result.listId)
          this.router.navigate(['/list'],{queryParams:{listId:result.listId}});
        }else{
          this.errorMessage = result['message']
        }
      },
      error: err => this.errorMessage = "There was an error"
    })
  }

  ngOnDestroy(): void{
    this.sub.unsubscribe();
  }

}
