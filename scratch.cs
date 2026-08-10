using System;
using Jint;

class Program {
    static void Main() {
        var jsCode = @"window.__NUXT__=(function(a,b,c){return {layout:""default"",data:[{items:[{uid:a,name:b,pricekr:c}]}]}}(""awoqywkd"", ""D. Maradona"", 7530000000000));";
        var engine = new Engine();
        engine.Execute("var window = {};");
        engine.Execute(jsCode);
        var json = engine.Evaluate("JSON.stringify(window.__NUXT__)").AsString();
        Console.WriteLine(json);
    }
}
