# CS509-Hyperenthusiasm
​​
Hello!

Hello, we are team Hyperenthusiasm. Thank you for using our website!

Site Link:
http://cs509-hyperenthusiasm-store-project.s3-website-us-east-1.amazonaws.com/
Demonstration Video:
https://youtu.be/GXELUyrD3AY

Here is a guide for every feature on the site to aid you in your usage of the site!
Log In
Corporate
To log in as a corporate user, go to the hub page and type in
Username: c_name
Password: c_pw

Manager
To log in as a manager user, go to the hub page and type in the credentials for a store you create as a corporate user.

Customer
To log in as a customer user, go to the hub page and click on the link “customer landing page”.

Corporate

Create Item

To create an item, fill in the form underneath the heading “Create Item” and click on Create Item, you will then see a list containing all existing items in the database.

Assign Item Location

To assign an item location, fill in the form underneath the heading “Assign Item Location” and click on Assign Location. Make sure to enter an existing item SKU.

Create Store

To create a store, fill in the form underneath the heading “Create Store” and click on Create Store. Make sure to enter valid latitude and longitude that do not go out of their respective ranges. 
Upon success, you will then see a table containing the data for all existing stores.

List Stores

To list the existing stores, click on the List Stores button below the Add Store button. You will then see a table containing the data for all existing stores.

Remove Store

To remove a store, first list the existing stores with the list stores function. Then click on the Remove button in the row of the store you would like to remove.

Generate Total Inventory Report

To generate the total inventory report, click on Generate below the “Generate Total Inventory Report” header. You will then see the inventory reports for all existing stores in the database, and the total value of all stores.

Generate Inventory Report

To generate a report for a specific store, fill in the Store ID form below the “Generate Inventory Report” header. You can get these IDs through the List Stores function. Then click Generate to see the items and total value of that specified store.

Manager

Process Shipment

To process a shipment of items, first fill in the form with the label “# of Items in Shipment:” underneath the header “Process Shipment”. Specify the number of different items in this shipment. Then click Open Form. From there you will see a form with an SKU field and a QTY field for every item you specified. Fill in those fields and click on Process Shipment. The site will then tell you which items and what quantities when to shelves and which ones went to overstock.

Generate Inventory Report

To generate the inventory report, click on Generate below the “Generate Inventory Report” header. You will then see the inventory report for the store managed by this user.

Generate Overstock Report

To generate the overstock report, click on Generate below the “Generate Overstock Report” header. You will then see the overstock report for the store managed by this user.

Fill Shelves

To fill shelves, click on the Fill button below the “Fill Shelves” header. This will move items from overstock to the inventory provided the inventory is below capacity. The site will then update you on which items were moved and in what quantities.

Show Missing Items

To fill shelves, click on the Fill button below the “Fill Shelves” header. This will move items from overstock to the inventory provided the inventory is below capacity. The site will then update you on which items were moved and in what quantities.

Customer

List Stores

To list stores as a customer, fill in the form below the header “Search Stores Near You”. The form should be the GPS coordinates of the customer user. Then, click on List Stores. You will then be shown a table containing all existing stores displayed in ascending order of distance from the specified point.

List Items on Shelf

To list the items on a shelf at a store, fill in the form below the header “Check Shelf” with the aisle and shelf number and the store ID of the store you want to check. You can pull the store ID from the list stores function on the left. Then click on List Items on Shelf. You will be shown a table containing all items on that shelf and in what quantities.

Search for Item

To search for an item, fill in the form below the “Search for Item” header. The search will default to the SKU if that is filled, for which it requires a perfect match. It will then go to name then description, for which a partial match will do as long as the search term is contained within the name or description.
Then fill in the latitude and longitude of the customer and click on Search Item. You will be displayed a table of all stores containing that item with the quantity they have in stock, displayed in ascending order of distance from the specified point.

Buy Item

To buy an item, first utilize the search for item function to specify which item. Then, in each row of the displayed table will be a form with a purchase quantity and a buy button. Fill that in inside the row of the store you want to buy from. Upon success, you will be notified of a successful purchase.
If you try to buy an invalid quantity (more than in stock, negative amount), you will be notified of the purchase failing.

