import {getTodoManagerServiceInstance} from "../services/TodoManagerService.js";

const {WebcController} = WebCardinal.controllers;

export default class TodoListController extends WebcController {
  constructor(...props) {
    super(...props);
    getTodoManagerServiceInstance(this, (todoService) => {
      this.TodoManagerService = todoService;
      // Populate existing todos to item list
      this.populateItemList((err, data) => {
        if (err) {
          return this._handleError(err);
        } else {
          console.log(data);
          this.setItemsClean(data);
        }
        // Init the listeners to handle events
        setTimeout(this.initListeners, 100);
      });
    });

    // Set some default values for the view model
    this.model = {
      items: [],
      item: {
        id: "item",
        name: "item",
        value: "",
        priority_val: 2,
        placeholder: "Type your item here",
      },
      priority: {
        id: "item_priority",
        name: "priority",
        value: 2,
        placeholder: "Normal",
      },
      "no-data": "There are no TODOs",
    };
    this.filteredData = [];
  }

  initListeners = () => {
    // Select the creating field and add
    // focusout event listener
    // This is used for creating new todo elements
    const todoCreatorElement = this.getElementByTag("create-todo");
    if (todoCreatorElement) {
      // todoCreatorElement.addEventListener("focusout", this._mainInputBlurHandler);
      todoCreatorElement.addEventListener("click", this._mainInputBlurHandler);
    }
    const sortingElement = this.getElementByTag("sorting");
    if (sortingElement) {
      sortingElement.addEventListener("click", this._sortClickHandler);
    }
    const resetFilteringElement = this.getElementByTag("reset-filtering");
    if (resetFilteringElement) {
      resetFilteringElement.addEventListener("click", this._resetFiltering);
    }
    const filteringElement = this.getElementByTag("filtering");
    if (filteringElement) {
      filteringElement.addEventListener("change", this._selectFocusOutHandler);
    }

    // Selecting the parent of all the items and add the event listeners
    const itemsElement = this.getElementByTag("items");
    if (itemsElement) {
      itemsElement.addEventListener("focusout", this._blurHandler);
      itemsElement.addEventListener("click", this._clickHandler);
      itemsElement.addEventListener("dblclick", this._doubleClickHandler);
    }
  };

  populateItemList(callback) {
    this.TodoManagerService.listToDos(callback);
  }

  _addNewListItem() {
    let fieldIdentifier = crypto.randomUUID();
    let priority_text = "Normal";
    console.log(this.model.item);
    switch (this.model.priority.value) {
      case "1":
        priority_text = "Later";
        break;
      case "2":
        priority_text = "Normal";
        break;
      case "3":
        priority_text = "Urgent";
        break;
    }
    let newItem = {
      checkbox: {
        name: "todo-checkbox-" + fieldIdentifier,
        checked: false,
      },
      input: {
        name: "todo-input-" + fieldIdentifier,
        value: this.model.item.value,
        readOnly: true,
      },
      priority: {
        name: "todo-prio-" + fieldIdentifier,
        value: priority_text,
      },
      priority_val: {
        name: "todo-prio-val-" + fieldIdentifier,
        value: this.model.priority.value,
      },
      delete: {
        name: "todo-delete-" + fieldIdentifier,
      },
    };

    this.TodoManagerService.createToDo(newItem, (err, data) => {
      if (err) {
        return this._handleError(err);
      }
      // Bring the path and the seed to the newItem object
      newItem = {
        ...newItem,
        ...data,
      };

      // Appended to the "items" array
      this.model.items.push(newItem);

      // Clear the "item" view model
      this.model.item.value = "";
    });
  }

  stringIsBlank(str) {
    return !str || /^\s*$/.test(str);
  }

  _mainInputBlurHandler = (event) => {
    console.log("_mainInputBlurHandler");
    const todoCreatorElementInput = this.getElementByTag(
      "create-priority-input"
    );
    // We shouldn't add a blank element in the list
    if (!this.stringIsBlank(todoCreatorElementInput.value)) {
      this._addNewListItem();
    }
  };

  _blurHandler = (event) => {
    // Change the readOnly property to true and save the changes of the field
    let currentToDo = this.changeReadOnlyPropertyFromEventItem(event, true);
    this.editListItem(currentToDo);
  };

  _doubleClickHandler = (event) => {
    // Change the readOnly property in false so we can edit the field
    this.changeReadOnlyPropertyFromEventItem(event, false);
  };

  changeReadOnlyPropertyFromEventItem = (event, readOnly) => {
    let elementName = event.target.name;
    // If the element that triggered the event was not a todo-input we ignore it
    if (!elementName || !elementName.includes("todo-input")) {
      return;
    }

    // Find the wanted element and change the value of the read-only property
    let items = this.model.items;
    let itemIndex = items.findIndex((todo) => todo.input.name === elementName);
    items[itemIndex].input = {
      ...items[itemIndex].input,
      readOnly: readOnly,
    };
    
    this.setItemsClean(items);
    return items[itemIndex];
  };

  _clickHandler = (event) => {
    const elementName = event.target.name;
    console.log(elementName);
    console.log(event.target);

    if (!elementName) {
      return;
    }

    if (elementName.includes("todo-checkbox")) {
      this._changeToDoCheckedState(event);
    }

    if (elementName.includes("todo-delete")) {
      this._deleteItem(event);
    }

    if (elementName.includes("az-todo-sort")) {
      this._sortTodos(event);
    }
  };

  _selectFocusOutHandler = () => {
    var select = document.getElementById("selection");
    var selectionValue = select.options[select.selectedIndex].value;
    console.log(selectionValue);
    this._clientItemsFiltering(selectionValue);
    //this._apiItemsFiltering(selectionValue)
  };

  _clientItemsFiltering = (selectionValue) => {
    this.TodoManagerService.listToDos((err, data) => {
      if (err) {
        return this._handleError(err);
      } else {
        this.filteredData = data;
        if (
          selectionValue == "1" ||
          selectionValue == "2" ||
          selectionValue == "3"
        ) {
          this.filteredData = data.filter((todo) => {
            return todo.priority_val.value === selectionValue;
          });
        } else if (selectionValue === "4") {
          this.filteredData = data.filter((todo) => {
            return todo.checkbox.checked;
          });
        } else if (selectionValue === "5") {
          this.filteredData = data.filter((todo) => {
            return !todo.checkbox.checked;
          });
        }
        this.setItemsClean(this.filteredData);
      }
    });
  };

  _resetFiltering = () => {
    this.populateItemList((err, data) => {
      if (err) {
        return this._handleError(err);
      } else {
        this.filteredData = [];
        this.setItemsClean(data);
      }
    });
  }

  _apiItemsFiltering = (selectionValue) => {
    if (selectionValue === "1") {
      this._filterByLater();
    } else if (selectionValue === "2") {
      this._filterByNormal();
    } else if (selectionValue === "3") {
      this._filterByUrgent();
    } else if (selectionValue === "4") {
      this._filterByChecked();
    } else if (selectionValue === "5") {
      this._filterByNotChecked();
    }
  };

  _filterByLater = () => {
    this.TodoManagerService.filterToDoByProperty(
      "priority_val",
      1,
      (err, data) => {
        if (err) {
          return this._handleError(err);
        } else {
          this.setItemsClean(data);
        }
      }
    );
  };

  _filterByNormal = () => {
    this.TodoManagerService.filterToDoByProperty(
      "priority_val.value",
      2,
      (err, data) => {
        if (err) {
          return this._handleError(err);
        } else {
          this.setItemsClean(data);
        }
      }
    );
  };

  _filterByUrgent = () => {
    this.TodoManagerService.filterToDoByProperty(
      "priority_val.value",
      3,
      (err, data) => {
        if (err) {
          return this._handleError(err);
        } else {
          this.setItemsClean(data);
        }
      }
    );
  };

  _filterByChecked = () => {
    this.TodoManagerService.filterToDoByProperty(
      "checkbox.checked",
      true,
      (err, data) => {
        if (err) {
          return this._handleError(err);
        } else {
          this.setItemsClean(data);
        }
      }
    );
  };

  _filterByNotChecked = () => {
    this.TodoManagerService.filterToDoByProperty(
      "checkbox.checked",
      false,
      (err, data) => {
        if (err) {
          return this._handleError(err);
        } else {
          this.setItemsClean(data);
        }
      }
    );
  };

  _sortClickHandler = (event) => {
    const elementName = event.target.getAttribute("name");
    console.log(elementName);
    // console.log(event.target);

    if (!elementName) {
      return;
    }

    if (elementName.includes("az-todo-sort")) {
      this._AZsortTodos(event);
    }
    if (elementName.includes("prio-todo-sort")) {
      this._PrioSortTodos(event);
    }
    if (elementName.includes("checked-todo-sort")) {
      this._CheckSortTodos(event);
    }
  };

  _AZsortTodos = (event) => {
    this.populateItemList((err, data) => {
      if (err) {
        return this._handleError(err);
      } else {
        console.log("AZ Sort");
        if(this.filteredData.length > 0){
          data = data.filter(element => {
            let commonElement = this.filteredData.filter(filteredElement => {
              if(filteredElement.input.name === element.input.name){
                return true;
              }
            });
            if(commonElement.length > 0){
              return true;
            }
          });
        }
        for (let i = 0; i < data.length; i++) {
          for (let j = i; j < data.length; j++) {
            if (data[i].input.value > data[j].input.value) {
              let temp = data[i];
              data[i] = data[j];
              data[j] = temp;
            }
          }
        }
        this.setItemsClean(data);
      }
    });
  };

  _PrioSortTodos = (event) => {
    this.populateItemList((err, data) => {
      if (err) {
        return this._handleError(err);
      } else {
        console.log("prio Sort");
        if (this.filteredData.length > 0) {
          data = data.filter((element) => {
            let commonElement = this.filteredData.filter((filteredElement) => {
              if (filteredElement.input.name === element.input.name) {
                return true;
              }
            });
            if (commonElement.length > 0) {
              return true;
            }
          });
        }
        for (let i = 0; i < data.length; i++) {
          for (let j = i + 1; j < data.length; j++) {
            if (data[i].priority_val) {
              if (data[i].priority_val.value < data[j].priority_val.value) {
                let temp = data[i];
                data[i] = data[j];
                data[j] = temp;
              }
            } else {
              let temp = data[i];
              data[i] = data[j];
              data[j] = temp;
            }
          }
        }
        this.setItemsClean(data);
      }
    });
  };

  _CheckSortTodos = (event) => {
    this.populateItemList((err, data) => {
      if (err) {
        return this._handleError(err);
      } else {
        if (this.filteredData.length > 0) {
          data = data.filter((element) => {
            let commonElement = this.filteredData.filter((filteredElement) => {
              if (filteredElement.input.name === element.input.name) {
                return true;
              }
            });
            if (commonElement.length > 0) {
              return true;
            }
          });
        }
        console.log("check Sort");
        console.log(data);
        let l = 0;
        let r = data.length - 1;
        while (l < r) {
          if (data[l].checkbox.checked != data[r].checkbox.checked) {
            if (data[l].checkbox.checked) {
              let temp = data[l];
              data[l] = data[r];
              data[r] = temp;
            }
          }
          if (data[r].checkbox.checked) {
            r = r - 1;
          }
          if (!data[l].checkbox.checked) {
            l = l + 1;
          }
        }
        // for (let i = 0; i < data.length; i++){
        //     if (data[i].checkbox.checked){
        //         let j=i+1;
        //         let k = i;
        //         while (j < data.length){
        //             let temp = data[k];
        //             data[k] = data[j];
        //             data[j] = temp;
        //             j = j+1;
        //             k = k+1;
        //         }
        //     }
        // }
        console.log(data);
        this.setItemsClean(data);
      }
    });
  };

  _deleteItem = (event) => {
    const itemToDelete = this.model.items.find(
      (item) => item.delete?.name === event.target.name
    );
    this.removeListItem(itemToDelete);
  };

  _changeToDoCheckedState = (event) => {
    // Find the wanted element and change the value of the checked property
    let items = this.model.items;
    let itemIndex = items.findIndex(
      (todo) => todo.checkbox.name === event.target.name
    );
    items[itemIndex].checkbox = {
      ...items[itemIndex].checkbox,
      checked: !items[itemIndex].checkbox.checked,
    };
    this.setItemsClean(items);
    this.editListItem(items[itemIndex]);
  };

  todoIsValid(todo) {
    // Check if the todo element is valid or not
    return !(!todo || !todo.input || !todo.checkbox);
  }

  removeListItem(todo) {
    if (!this.todoIsValid(todo)) {
      console.log("invalid todo, cannot remove");
      return;
    }
    console.log("Todo to remove: " + todo);
    this.TodoManagerService.removeToDo(todo, (err, data) => {
      if (err) {
        return this._handleError(err);
      } else {
        const updatedItems = this.model.items.filter(
          (item) => todo.input.name !== item.input.name
        );
        console.log("Items after remove: " + updatedItems);
        this.setItemsClean(updatedItems);
      }
    });
  }

  editListItem(todo) {
    if (!this.todoIsValid(todo)) {
      return;
    }
    this.TodoManagerService.editToDo(todo, (err, data) => {
      if (err) {
        return this._handleError(err);
      }
    });
  }

  setItemsClean = (newItems) => {
    if (newItems) {
      // Set the model fresh, without proxies
      this.model.items = JSON.parse(JSON.stringify(newItems));
      console.log(newItems);
    } else {
      this.model.items = [];
    }
  };

  _handleError = (err) => {
    console.log(err);
    const message =
      "Caught this:" + err.message + ". Do you want to try again?";
    this.showErrorModal(
      message, // An error or a string, it's your choice
      "Oh no, an error..",
      () => {
        console.log("Let's try a refresh");
        window.location.reload();
      },
      () => {
        console.log("You choose not to refresh! Good luck...");
      },
      {
        disableExpanding: true,
        cancelButtonText: "No",
        confirmButtonText: "Yes",
        id: "error-modal",
      }
    );
  };
}
