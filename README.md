## Action Points

- install @nestjs/config, @nestjs/jwt, dataloader modules ----------------------------------------------
- use config-module for setting the mongodb uri --------------------------------------------
- for account-model, add new index for email-address and set it to unique true -------------------------------------------------
- rename type UserType to UserDocument ------------------------------------
- rename account-service methods to more suitable name, e.g. retrieve => retrieveByEmailAddress ----------------------------------
- for dataloader, use the retrieval of multiple documents instead of findOne and mapped the resulting documents by their keys/ids -------------------------
- rename the file private-directive, and add verification for token type -------------------------------------
- for product-model:
  - change owner type to binary/id instead of saving the whole account document --------------------------
  - add cursor field, by default it should be a buffer of the current timestamp ------------------
- for product resolver, add new field-resolver for owner. which is to retrieve the account details given the product owner ------------------------
