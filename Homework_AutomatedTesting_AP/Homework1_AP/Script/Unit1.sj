function Main()
{
  try
  {
  f_Creating_editing_and_verifying()
  
  //Creating_file();    
  //Verifying_created_file(); 
  //Editing_file();  
  //Verifying_edited_file();
  }
  catch(exception)
  {
    Log.Error("Exception", exception.description);
  }
}


function f_Creating_editing_and_verifying()  
{
Creating_file()
Verifying_created_file()
Editing_file()
Verifying_edited_file() 
}

/*function f1_Creating_and_Verifying()
{
Creating_file()
Verifying_created_file()
}

function f2_Editing_and_Verifying()
{
Editing_file()
Verifying_edited_file() 
}
*/
function Creating_file()
{
  TestedApps.notepad.Run();
  Aliases.notepad1.wndNotepad.Edit.Keys("This file is created by Test1.");
  Aliases.notepad1.wndNotepad.MainMenu.Click("File|Save");
  Aliases.notepad1.dlgSaveAs.SaveFile("E:\\Bionic-QA-12-AP\\file_for_Tests.txt", "Text Documents (*.txt)");
  //Aliases.notepad1.wndNotepad.Close();
  TestedApps.notepad.Close();

}

function Verifying_created_file()
{
  TestedApps.notepad.Run();
  Aliases.notepad1.wndNotepad.MainMenu.Click("File|Open...");
  Aliases.notepad1.dlgOpen.OpenFile("E:\\Bionic-QA-12-AP\\file_for_Tests.txt", "Text Documents (*.txt)");
  aqObject.CompareProperty(Aliases.notepad1.wndNotepad.Edit.wText, 0, "This file is created by Test1.", false);
  //Aliases.notepad1.wndNotepad.Close();
  TestedApps.notepad.Close(); 
}

function Editing_file()
{
  TestedApps.notepad.Run();
  Aliases.notepad1.wndNotepad.MainMenu.Click("File|Open...");
  Aliases.notepad1.dlgOpen.OpenFile("E:\\Bionic-QA-12-AP\\file_for_Tests.txt", "Text Documents (*.txt)");
  Aliases.notepad1.wndNotepad.Edit.Click(142, 8);
  Aliases.notepad1.wndNotepad.Edit.Keys("[BS][BS][BS][BS]edi");
  Aliases.notepad1.wndNotepad.Edit.Click(227, 8);
  Aliases.notepad1.wndNotepad.Edit.Keys("[BS]2");
  Aliases.notepad1.wndNotepad.MainMenu.Click("File|Save");
  //Aliases.notepad1.wndNotepad.Close();
  TestedApps.notepad.Close(); 
}

function Verifying_edited_file()
{
  TestedApps.notepad.Run();
  Aliases.notepad1.wndNotepad.MainMenu.Click("File|Open...");
  Aliases.notepad1.dlgOpen.OpenFile("E:\\Bionic-QA-12-AP\\file_for_Tests.txt", "Text Documents (*.txt)");
  aqObject.CompareProperty(Aliases.NOTEPAD.wndNotepad.Edit.wText, 0, "This file is edited by Test2.", false);
  Aliases.notepad1.wndNotepad.Click(364, 23);
  //Aliases.notepad1.wndNotepad.Close();
  TestedApps.notepad.Close(); 
  aqFileSystem.DeleteFile("E:\\Bionic-QA-12-AP\\file_for_Tests.txt"); 
}
