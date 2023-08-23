## Action Points

- integration & unit tests
  ~~ - test name to kebab case ~~
- make the file libraries as simple as possible, separate multiple operations in a single file
  ~~ - in product graphql schema, chance owner type to Account! ~~
  ~~ - transfrom \_id to id via virtuals in mongoose schema ~~
  ~~ - in create-product, convert the owner to string directly, no need to cast it to buffer ~~
  ~~ in dataloader use \_id for filtering and use the .equals instead .compare ~~
  ~~ - in Binary scalar, handle ids that are ObjectId ~~
  ~~ - in account & product model, override the id. set the id to false in schema and add virtual id with value \_id ~~
- in tests, use the account & product service for creating documents instead calling graphql requests
