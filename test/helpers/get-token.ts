import supertest from 'supertest';

export async function getToken(
  request: supertest.SuperTest<supertest.Test>,
  input: {
    emailAdress: string;
    password: string;
  },
) {
  const response = await request.post('/graphql').send({
    query: `
        mutation($input: AuthenticateInput!){
          authenticate(input: $input){
            token
          }
        }
        `,
    variables: { input },
  });

  const token = response.body.data.authenticate.token;

  return {
    token: token,
  };
}
