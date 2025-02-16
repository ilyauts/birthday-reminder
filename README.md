# birthday-reminder

<img src="./logo.webp" style="width: 50%; margin: 20px 25%;"> 

With the fall of Facebook, it has become increasing difficult to keep track of friends' birthdays. This simple script helps seamlessly port data from a Google Sheet that it used as a DB and remind you of your friends' biggest life events!

## Parameters
`SPREADSHEET_ID` needs to be set within the `script.js` file.


## Instructions

 ### Setting up the spreadsheet

 To get you started, we've created a [template spreadsheet](https://docs.google.com/spreadsheets/d/1DsexhFqRNXAa-tO0u2okr7DKONtwBisNXoht7wAIq74/) which you can clone and use as the database for this project.
 
 All birthdays in the DB are expected to be in the form of MM/DD/YYYY. If you happen to not know any of the requiste information for the birthday, feel free to enter `????`. As an example, if I didn't know the year of someone's birthday, but I knew the month and day, I'd enter: 02/02/????. The script automatically ignores any birthdays with the `????` substring.

 ### Setting up the script

 Once the spreadsheet is seeded with all of the birthdays that you need (at least for now), go to [AppScript](https://script.google.com/home) and create a New project.

 On the left side, under `Services`, add `Calendar` (version v3) and `Sheets` (version v4).

 Then paste the contents of `script.js` and save (ctrl + s).

 [Find your DB's spreadsheet ID](https://stackoverflow.com/questions/36061433/how-do-i-locate-a-google-spreadsheet-id) and paste it in the script (replacing the contents of `SPREADSHEET_ID`);

 Finally, switch the function to execute on the top dropdown to `main` and click `Run`.

 If all the data and integration was set up correctly, you should now have calendar events!