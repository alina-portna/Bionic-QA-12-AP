function Main()
{
  try
  {
    // Enter your code here. 
  }
  catch(exception)
  {
    Log.Error("Exception", exception.description);
  }
}

function Substraction()
{
  TestedApps.calc.Run();
  Aliases.calc.wndCalculator.btn8.ClickButton();
  Aliases.calc.wndCalculator.btn.ClickButton();
  Aliases.calc.wndCalculator.btn3.ClickButton();
  Aliases.calc.wndCalculator.btn1.ClickButton();
  aqObject.CompareProperty(Aliases.calc.wndCalculator.Edit.wText, 0, "7. ", false);
  Aliases.calc.wndCalculator.Click(29, 11);
  Aliases.calc.wndCalculator.Click(191, 10);
  Aliases.calc.wndCalculator.Close();
}
