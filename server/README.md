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
Rotas
1. Registro de Usuário (POST /signup)
Esta rota lida com a criação de novos usuários.

Validação: Utiliza signupSchema.parse(req.body) para validar os dados recebidos. Se falhar, vai para o bloco catch.
Verificação de Existência: Consulta o banco de dados para ver se o e-mail já está cadastrado (UserModel.findOne). Retorna erro 400 se já existir.
Hash da Senha: Criptografa a senha do usuário usando bcrypt.hash(password, 10) (10 rounds de salt). Nunca salvamos senhas em texto puro.
Criação: Salva o novo usuário no banco de dados.
Token e Cookie:
Gera um token JWT para o novo usuário.
Define um cookie chamado auth_token com o token.
Configurações do Cookie:
httpOnly: true: Impede que JavaScript no navegador (client-side) acesse o cookie, protegendo contra ataques XSS.
secure: Em produção, exige HTTPS.
sameSite: 'lax': Proteção contra ataques CSRF.
maxAge: Define a validade do cookie para 7 dias (mesmo tempo do token).
Resposta: Retorna o token e os dados básicos do usuário (ID e email).
2. Login (POST /login)
Rota para autenticar usuários existentes.

Busca: Procura o usuário pelo e-mail. Se não encontrar, retorna erro 401 (Não autorizado).
Verificação de Senha: Compara a senha enviada com o hash salvo no banco usando bcrypt.compare.
Token e Cookie: Se a senha estiver correta, gera um novo token e o define no cookie auth_token (mesmas configurações do signup).
Resposta: Retorna sucesso com o token e dados do usuário.
3. Perfil do Usuário (GET /me)
Rota para verificar quem está logado atualmente. Recupera os dados do usuário com base no token ou cookie válido.

Nota: Idealmente, a lógica de extração e verificação do token seria um Middleware separado, mas aqui está implementada diretamente na rota para simplicidade.
Extração do Token: Tenta ler o token do cookie auth_token OU do cabeçalho Authorization (formato Bearer).
Verificação: Usa jwt.verify para decodificar o token.
Busca no Banco: Busca o usuário pelo ID decodificado (decoded.userId), excluindo o campo de senha (.select('-password')).
Resposta: Retorna o objeto do usuário ou erro 401 se o token for inválido/expirado ou o usuário não existir.
4. Logout (POST /logout)
Rota para encerrar a sessão.

Limpeza: Usa res.clearCookie('auth_token') para instruir o navegador a deletar o cookie de autenticação.
Resposta: Retorna uma mensagem de confirmação.

Tratamento de Erros
O bloco try/catch é usado em operações assíncronas.
No /signup, há um tratamento específico para erros de validação do Zod (error instanceof z.ZodError), retornando detalhes do que falhou na validação.
Erros genéricos retornam status 500 ("Internal server error").
