# Todo App
Todo App created with HTML, CSS, and JavaScript.



## Demo (GitHub Pages)
<https://alston13r.github.io/todo/>



## About
This is my attempt at making a Todo App with some JavaScript. It features a tree structure where Tasks can be created and stored in groups.



## Installation
Since this is plain JavaScript with no modules, you can directly open the `index.html` file in your browser. You can clone this project with:
`git clone https://github.com/alston13r/todo/`

If you want to use the production version, this is provided on GitHub Pages at <https://alston13r.github.io/todo/>.



## Usage
On your first time using the Todo app, or whenever you have no Tasks, there will be a plus button. Clicking it will prompt you for a Task name.

Tasks are displayed with their name, a dropdown of possible states, and a trash button.
* You can right click on the Task to open the context menu. As of right now, Tasks can be renamed.
* The dropdown features 3 states: Todo, In Progress, and Complete.
* The trash button will delete the Task. If the Task is a group, then all sub-tasks will deleted as well. I will add a confirmation button for deleting groups soon.

When hovering over a Task, three plus '+' buttons will show up. Each one, when clicked, will prompt the user for a Task name.
* The top button will add a Task just before this one.
* The bottom button will add a Task just after this one.
* The right button will add a Task within this one. This treats the current Task as if it were a group, or a folder.

Groups, or folders, feature the folder icon. You can left-click on groups to expand or collapse the group. I will allow for custom icons soon.