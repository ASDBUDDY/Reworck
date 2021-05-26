const newListForm = document.querySelector('[data-new-list-form]')
const newListInput = document.querySelector('[data-new-list-input]')
const newTaskForm = document.querySelector('[data-new-task-form]')
const newTaskInput = document.querySelector('[data-new-task-input]')
const listsContainer = document.querySelector('[data-lists]')
const tasksContainer = document.querySelector('[data-tasks]')
const listDisplayContainer = document.querySelector('[data-list-display-container]')
const deleteListButton = document.querySelector('[data-delete-list-button]')
const taskTemplate = document.getElementById('task-template')
const listTitleElement = document.querySelector('[data-list-title]')
const listCountElement = document.querySelector('[data-list-count]')
const clearCompleteTasksButton = document.querySelector('[data-clear-complete-tasks-button]')
const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
const arrayRemove = firebase.firestore.FieldValue.arrayRemove;
let selectedListID = null;

// Rendering Task Container
function render(){
    if (selectedListID == null) {
        listDisplayContainer.style.display = 'none'
        listTitleElement.innerText = '';
        clearElement(tasksContainer);
      }
        else {
        listDisplayContainer.style.display = ''
        renderTaskCount();
      }
}

// Deleting List
deleteListButton.addEventListener('click', e =>{
    e.preventDefault();
    db.collection('userData').doc(selectedListID).delete();
    selectedListID = null;
})

// Selecting List
listsContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
      selectedListID = e.target.getAttribute('data-id');
      var active = listsContainer.querySelectorAll('li')
    for(let i= 0; i< active.length; i++) {
    if(active[i].classList.contains('active-list'))
    active[i].classList.remove('active-list');}
      e.target.classList.add('active-list');
      db.collection('userData').doc(selectedListID).get().then((snapshot) => {
          listTitleElement.innerText = snapshot.data().List;
          clearElement(tasksContainer);
      renderTasks(snapshot);
      })
      render();
    }
  })

  // Checking Tasks
  tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input') {
        db.collection('userData').doc(selectedListID).get().then((snapshot) => {
            for(let i = 0; i < snapshot.data().taskList.length; i++){
            if(snapshot.data().taskList[i].id === e.target.id){
                
                let taskName = snapshot.data().taskList[i].Task;
                let taskID = snapshot.data().taskList[i].id;
                let checkFlag = snapshot.data().taskList[i].complete;
                db.collection('userData').doc(selectedListID).update({
                    taskList: arrayRemove({
                        Task: taskName,
                        complete: checkFlag,
                        id: taskID
                    })
                });
                db.collection('userData').doc(selectedListID).update({
                    taskList: arrayUnion({
                        Task: taskName,
                        complete: e.target.checked,
                        id: taskID
                    })
                });

                
            }
        }
            })
    }
  })

// Clear Completed Tasks
clearCompleteTasksButton.addEventListener('click', e => {
e.preventDefault();
let counter = false;
db.collection('userData').doc(selectedListID).get().then((snapshot) => {
    if(snapshot.data().taskList){
    for(let i = 0; i < snapshot.data().taskList.length; i++){
    if(snapshot.data().taskList[i].complete == true){
        counter = true;
        let taskName = snapshot.data().taskList[i].Task;
        let taskID = snapshot.data().taskList[i].id;
        let checkFlag = snapshot.data().taskList[i].complete;
        db.collection('userData').doc(selectedListID).update({
            taskList: arrayRemove({
                Task: taskName,
                complete: checkFlag,
                id: taskID
            })
        });
    }
}
if(counter){
    clearElement(tasksContainer);  
            db.collection('userData').doc(selectedListID).get().then((newSnapshot) => {
                renderTasks(newSnapshot);
            })
        }
    }
    })

    
})

// Render Task Count
function renderTaskCount(){
    let incompleteTaskCount = 0;
db.collection('userData').doc(selectedListID).get().then((snapshot) => {
    if(snapshot.data().taskList){
    for(let i = 0; i < snapshot.data().taskList.length; i++){
    if(snapshot.data().taskList[i].complete == false){
        
            incompleteTaskCount++;

    }
}

    }
    const taskString = incompleteTaskCount === 1 ? "task" : "tasks"
listCountElement.innerText = `${incompleteTaskCount} ${taskString} remaining`
    })
}

// Saving Lists
newListForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const listName = newListInput.value
    if (listName == null || listName === '') return
    auth.onAuthStateChanged(user => {
        if (user) {
    db.collection('userData').add({
        List: listName,
        userID: user.uid
    });
    newListInput.value ='';}
})
})

// Saving Tasks
newTaskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskName = newTaskInput.value
    if (taskName == null || taskName === '') return
    auth.onAuthStateChanged(user => {
        if (user) {
            
    db.collection('userData').doc(selectedListID).update({
        taskList: arrayUnion({
            Task: taskName,
            complete: false,
            id: Date.now().toString()
        })
    });
    db.collection('userData').doc(selectedListID).get().then((snapshot) => {
        clearElement(tasksContainer);
        renderTasks(snapshot);
    })
    newTaskInput.value ='';}
})
})

// Getting Lists
function renderLists(doc){
    let li = document.createElement('li');
    li.setAttribute('data-id', doc.id);
    li.textContent = doc.data().List;

    listsContainer.appendChild(li);
}

// Getting Tasks
function renderTasks(doc){
    if(doc.data().taskList){
    doc.data().taskList.forEach(task => {
        const taskElement = document.importNode(taskTemplate.content, true)
    const checkbox = taskElement.querySelector('input')
    checkbox.id = task.id
    checkbox.checked = task.complete
    const label = taskElement.querySelector('label')
    label.htmlFor = task.id
    label.append(task.Task)
    tasksContainer.appendChild(taskElement)
    renderTaskCount();
    })
}
    
}

// Real-time Listener
auth.onAuthStateChanged(user => {
    if (user) {
db.collection('userData').where('userID', '==', user.uid).orderBy('List').onSnapshot(snapshot => {
    let changes = snapshot.docChanges();
    render();
    changes.forEach(change => {
        if(change.type == 'added'){
        renderLists(change.doc);
        if(selectedListID && selectedListID == change.doc.id){
            clearElement(tasksContainer);
            renderTasks(change.doc);
        }
        } else if (change.type == 'removed'){
            let li = listsContainer.querySelector('[data-id=' + change.doc.id + ']');
            listsContainer.removeChild(li);
        }
    })
})
    }
})


// Clear Element
function clearElement(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild)
    }
  }