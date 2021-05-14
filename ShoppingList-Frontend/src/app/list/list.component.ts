import { Component, OnInit } from '@angular/core';
import { Subscriber, Subscription } from 'rxjs';
import { ListItem, ShoppingList, ShoppingLists } from '../objects';
import { ListsService } from '../services/lists.service';
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import { ActivatedRoute,Router } from '@angular/router';

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
  
  constructor(private listService: ListsService, private router:Router,private activatedRoute:ActivatedRoute) { }

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

  processReturnedLists(data){
    this.lists = data['Responses']['sl-lists'];
    if(this.previouslySelectedListId){
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
