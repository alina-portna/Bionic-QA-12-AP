function Main()
{

  TestedApps.calc.Run();  
  
  var file = Files.FileNameByName("data.csv");
  Log.Message("Creating driver");
  
  var driver = DDT.CSVDriver(file);
  
  while(!driver.EOF())
  {
   var input1 = driver.Value(0);
   var sign = driver.Value(1);
   var input2 = driver.Value(2);
   var expected = driver.Value(3);
   //первый индекс столбца 
   
   Test_Operation(input1, sign, input2, expected);
   driver.Next();
   //выход из цикла
  
  }
  DDT.CloseDriver(file);
  
  
  //Test_Operation(4,"+",6,10);
 // Test_Operation(7,"-",2,5);      
 // Test_Operation(3,"**",4,12);      
  //Test_Operation(9,"/",3,3);      
  TestedApps.calc.Close(); 
}

function Test_Operation(input1,sign,input2,expected)
{ //TestedApps.calc.Run();

 
 Log.AppendFolder("Testt of operation" + sign);

 var wndCalculator = Aliases.calc.wndCalculator;
 
   wndCalculator.Window("Button",input1).Click();
   wndCalculator.Window("Button",sign).Click();
   wndCalculator.Window("Button",input2).Click();
   wndCalculator.Window("Button","=").Click();
 // wndCalculator.btn.ClickButton();
 // wndCalculator.btn6.ClickButton();
 // wndCalculator.btn1.ClickButton();

 
  aqObject.CompareProperty(Aliases.calc.wndCalculator.Edit.wText, cmpEqual, expected+". ");
  
  Log.PopLogFolder();
 // TestedApps.calc.Close();
}

function testmapping(){

Sys.Process("calc").Window("SciCalc", "Calculator", 1).Window("Button", "8", 9).Click();

NameMapping.Sys.calc.wndCalculator.btn8.Click();

Aliases.btn8.Click();

var b8=Aliases.btn8;

b8.Click();


}