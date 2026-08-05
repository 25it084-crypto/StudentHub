console.log("studenthub JS Loaded Sucssesfully");
console.log("Welcome to Student Hub");
console.log("p-4 JAVASCRIPT");

//data types
let studentName="nik";
let course="it";
let semester=5;
console.log(studentName);
console.log(course);
console.log(semester);

let collage="charusat";
let year=2026;
let isStudent=true;
console.log(collage);
console.log(year);
console.log(isStudent);

//funtion eg
function welcomeMessage(){
    console.log("welcome to SH");
}

welcomeMessage();

//funtion with perameter
function welcomeStudent(name)
{
    console.log("welcome "+name);
}
welcomeStudent("nik");
welcomeStudent("harsh");
welcomeStudent("kavo");

//notification
let notification=document.getElementById("notification");
let closeBoutton=document.getElementById("closeBtn");
closeBoutton.onclick=function(){
    notification.style.display="none";
};
