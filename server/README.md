# Documentação da Rota de Autenticação (auth.ts)

Este arquivo implementa as rotas de autenticação para a API, utilizando **Express**, **JWT (JSON Web Token)** e **Bcrypt** para segurança, além de **Zod** para validação de dados.

## Dependências e Importações

*   **express**: Framework web para Node.js. Importa `Router`, `Request` e `Response` para tipagem e roteamento.
*   **jsonwebtoken (jwt)**: Biblioteca para criar e verificar tokens de autenticação.
*   **bcryptjs**: Biblioteca para hash de senhas (criptografia unidirecional).
*   **../models/User**: Importa o `UserModel`, que é a interface com o banco de dados (provavelmente MongoDB via Mongoose).
*   **zod**: Biblioteca de validação de esquemas para garantir que os dados de entrada estejam corretos.

## Configuração Inicial

*   **router**: Instância do roteador do Express para definir as rotas.
*   **SECRET_KEY**: Chave secreta usada para assinar os tokens JWT. Ela é lida das variáveis de ambiente (`process.env.JWT_SECRET`) ou usa um valor padrão ('supersecretkey') para desenvolvimento.

## Validação (Schema Zod)

```typescript
const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});