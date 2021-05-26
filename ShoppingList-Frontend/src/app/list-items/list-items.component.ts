import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ShoppingList, ListItem } from '../objects';
import { ListsService } from '../services/lists.service';

@Component({
  selector: 'app-list-items',
  templateUrl: './list-items.component.html',
  styleUrls: ['./list-items.component.css']
})
export class ListItemsComponent implements OnInit {
  //List Items
  @Input() selectedList: ShoppingList;
  //New Item
  itemNameControl = new FormControl();
  category: string = '';
  assignee: string = '';
  store: string = '';
  status: boolean = false;
  quantity: number = 1;
  options: string[] = ['Coke', 'Milk','Beer','Bread','Cooking Oil','Cereals','Cheese','Rice','Pasta','All Purpose Flour','Butter','Eggs','Onions','Tomato','Ginger','Garlic'];
  filteredOptions: Observable<string[]>;
  addItemPanelOpenState = false;
  @Output() notifyAddItem: EventEmitter<ShoppingList> = new EventEmitter<ShoppingList>();
  
  constructor(private listService:ListsService) { }

  checkItem(item){
    item.stats = true;
  }

  expandAddSection(){
    this.addItemPanelOpenState = !this.addItemPanelOpenState;
  }

  ngOnInit(): void {
    this.filteredOptions = this.itemNameControl.valueChanges
    .pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  addItem(){
    let newItem = { 
      name:this.itemNameControl.value, 
      category:this.category,
      store:this.store,
      status:this.status,
      assignee:this.assignee,
      quantity:this.quantity,
   };
   //this.selectedList.items.push(newItem);
   this.listService.addItemToList(newItem,this.selectedList.id).subscribe({
    next: (results) => this.onAddComplete(results),
    error: (err) => console.log(err),
  })
  }

  private onAddComplete(result){
    console.log('------On add complete-----')
    console.log(result);
    //this.selectedList = result['list']
    this.notifyAddItem.emit(result['list'])
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }



}
