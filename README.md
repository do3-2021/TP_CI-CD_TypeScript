# TP CI/CD

# Contexte

Pour ce tp, nous avons crée un projet CI/CD permettant de faire un build et un déploiement automatique d’une petite api web possédant les routes suivantes.

| Method | Route     | Description            |
| ------ | --------- | ---------------------- |
| POST   | /city     | Create new city        |
| GET    | /city     | Get all cities         |
| GET    | /\_health | Get application health |

## Intégration continue

Nous avons deux scripts d’intégration.

L’un déclenché sur chaque action d’une Pull Request:

- Run linter
- Run tests
- Build docker image
- Push docker image sur `ascoz/city-api:${{ github.sha }}`. Le `sha` correspond au hash du commit en question.

L’autre déclenché sur chaque tag de version `*.*.*`:

- Build docker image
- Push docker image sur `ascoz/city-api:${{ github.ref_name }}` et `ascoz/city-api:latest`. Le tag `ref_name` correspond au tag déclencheur de l’action.

Nous avons aussi un fichier `docker-compose.yml` permettant d’exécuter une base de données postgres.
