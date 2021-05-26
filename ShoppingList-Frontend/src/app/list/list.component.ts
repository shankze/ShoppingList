import { Component, OnInit } from '@angular/core';
import { Subscriber, Subscription } from 'rxjs';
import { ListItem, ShoppingList, ShoppingLists } from '../objects';
import { ListsService } from '../services/lists.service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { ActivatedRoute,Router } from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import { CreateListComponent } from '../create-list/create-list.component';
import { ListClearComponent } from '../list-clear/list-clear.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  lists: ShoppingList[];
  selectedList:string = '';
  selectedListObject:ShoppingList;
  sub!: Subscription;
  errorMessage: string = '';
  listNames:string[];
  previouslySelectedListId:string;
  numberOfLists:number;
  
  constructor(private listService: ListsService, private router:Router,private activatedRoute:ActivatedRoute, private dialog: MatDialog) { }

  onListSelectChange(event){
    console.log(event.value)
    this.selectedListObject = this.lists.find(({id}) => id === event.value)
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams
    .subscribe(params => {
      console.log('Params: ',params);
      this.previouslySelectedListId = params.listId
    })
    this.sub = this.listService.getListItems().subscribe({
      next: lists => {  
        this.processReturnedLists(lists)
      },
      error: err => this.errorMessage = err
    })

  }

  shareList(){
    this.router.navigate(['/sharelist'],{queryParams:{listId:this.selectedListObject.id}});
  }

  createList(){
    this.router.navigate(['/createlist'])
  }

  deleteList(){
    //this.router.navigate(['/createlist'])
  }

  clearList(){
    const dialogRef = this.dialog.open(ListClearComponent, {data:{listId:this.selectedListObject.id}});
    //this.router.navigate(['/createlist'])

    dialogRef.afterClosed().subscribe(res => {
      console.log(res)
      if(res.action == 'clear'){
        console.log('Here')
        this.selectedListObject.items = []
      }
    })
  }

  notifyItemAddedToList(updatedList:ShoppingList):void{
    console.log('From Parent Component:')
    console.log(updatedList)
    this.selectedListObject = updatedList
  }

  processReturnedLists(data){
    this.lists = data;
    this.numberOfLists = this.lists.length
    console.log('Number of lists: ',this.numberOfLists)
    if(this.numberOfLists == 0){

    }
    else if(this.previouslySelectedListId){
      console.log('Setting previously selected Id')
      this.selectedList = this.previouslySelectedListId;
      this.selectedListObject = this.lists.find(({id}) =>id===this.previouslySelectedListId);
    }
    else{
      console.log('No previously selected Id')
      this.selectedList = this.lists[0]['id']
      this.selectedListObject = this.lists[0]
      console.log(this.selectedListObject)
    }
  }

  ngOnDestroy(): void{
    this.sub.unsubscribe();
  }
}
