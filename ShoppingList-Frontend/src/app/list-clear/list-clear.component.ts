import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DialogData } from '../objects';
import { ListsService } from '../services/lists.service';

@Component({
  selector: 'app-list-clear',
  templateUrl: './list-clear.component.html',
  styleUrls: ['./list-clear.component.css']
})
export class ListClearComponent implements OnInit {
  sub!: Subscription;
  errorMessage: string = '';
  
  constructor(public dialogRef: MatDialogRef<ListClearComponent>,@Inject(MAT_DIALOG_DATA) public data: DialogData,private listService: ListsService) { }

  ngOnInit(): void {
  }

  clearList(){
    console.log(this.data.listId)
    this.sub = this.listService.clearList(this.data.listId).subscribe({
      next: lists => {  
        this.processReturnedLists(lists)
      },
      error: err => this.errorMessage = err
    })
  }

  processReturnedLists(data){
    console.log(data)
    if(data.status == true){
      this.dialogRef.close({data:true,action:'clear'});
    }
  }

  cancel(){

  }


}
