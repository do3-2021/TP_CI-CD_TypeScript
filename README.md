# TP CI/CD

## Contexte

Pour ce tp, nous avons créé un projet CI/CD permettant de faire un build et un déploiement automatique d’une petite api web possédant les routes suivantes.

| Method | Route     | Description            |
| ------ | --------- | ---------------------- |
| POST   | /city     | Create new city        |
| GET    | /city     | Get all cities         |
| GET    | /\_health | Get application health |

## Développement

Nous avons développé l’api en TypeScript avec le runtime Deno et la librairie `oak` pour le routage et `postgres` comme driver de base de données. Deno intègre les outils de formatage, test et lint.

Lancement de l’application (nécessite une db configurée) :

```sh
deno run -A index.ts
```

Lancement des tests :

```sh
deno test -A
```

Exécution du lint:

```sh
deno lint
```

### variables d’environnement

| nom                  | valeur par défaut | description               |
| -------------------- | ----------------- | ------------------------- |
| CITY_API_DB_URL      | localhost         | adresse de la db          |
| CITY_API_DB_PORT     | 5432              | port de la db             |
| CITY_API_DB_USER     | postgres          | utilisateur de la db      |
| CITY_API_DB_PWD      | postgres          | mot de passe de la db     |
| CITY_API_DB_DATABASE | postgres          | database à utiliser       |
| CITY_API_ADDR        | 0.0.0.0           | adresse d’écoute de l’api |
| CITY_API_PORT        | 2022              | port d’écout de l’api     |

## Intégration continue

Nous avons deux scripts d’intégration.

Le premier est déclenché sur chaque action d’une Pull Request:

- Run linter
- Run tests
- Build docker image
- Push docker image sur `ascoz/city-api:${{ github.sha }}`. Le `sha` correspond au hash du commit en question.

Le second est déclenché sur chaque tag de version `*.*.*`:

- Build docker image
- Push docker image sur `ascoz/city-api:${{ github.ref_name }}` et `ascoz/city-api:latest`. Le tag `ref_name` correspond au tag déclencheur de l’action.

Nous avons aussi un fichier `docker-compose.yml` permettant d’exécuter une base de données postgres.

## Chart helm

Les fichiers de la chart sont dans le dossier `helm`.

Dans `values.yml` sont configurés les valeurs suivantes :

| nom                      | variable d’environnement | valeur de base |
| ------------------------ | ------------------------ | -------------- |
| postgresql.auth.username | CITY_API_DB_USER         | city           |
| postgresql.auth.password | CITY_API_DB_PWD          | city           |
| postgresql.auth.database | CITY_API_DB_DATABASE     | city           |
| api.addr                 | CITY_API_ADDR            | 0.0.0.0        |
| api.port                 | CITY_API_PORT            | 2022           |

La chart de base importe la chart `bitnami/postgresql` avec le nom postgresql.

Commande pour déployer :

```sh
helm install nomDeploiement ./helm
```

Désinstallation :

```sh
helm uninstall nomDeploiement
```

Sur minikube on peut tester (penser à installer l’addon nginx-ingress) : 

- récupérer l’adresse de l’ingress 
  
  ```sh
  $ minikube service list
  |---------------|------------------------------------|--------------|---------------------------|
  | NAMESPACE       | NAME                                 | TARGET PORT    | URL                         |
  | --------------- | ------------------------------------ | -------------- | --------------------------- |
  | default         | kubernetes                           | No node port   |
  | default         | test-city-api                        | No node port   |
  | default         | test-postgresql                      | No node port   |
  | default         | test-postgresql-0                    | No node port   |
  | default         | test-postgresql-hl                   | No node port   |
  | ingress-nginx   | ingress-nginx-controller             | http/80        | http://192.168.49.2:30164   |
  |                 |                                      | https/443      | http://192.168.49.2:32425   |
  | ingress-nginx   | ingress-nginx-controller-admission   | No node port   |
  | kube-system     | kube-dns                             | No node port   |
  | --------------- | ------------------------------------ | -------------- | --------------------------- |
  ```

  dans cet exemple l’ingress est accessible à l’url `http://192.168.49.2:30164`

- Lancer une requête avec comme host `localhost` :
  
  ```sh
  $ curl -H 'Host: localhost' http://192.168.49.2:30164/city
  []  
  ```

- Insertion :
  
  ```sh
    $ curl -H 'Host: localhost' http://192.168.49.2:30164/city -X POST -d '{
          "department_code": "01",
          "insee_code": "01001",
          "zip_code": "01400",
          "name": "L Abergement-Clémenciat",
          "lat": 46.15678199203189,
          "lon": 4.92469920318725
      }'
  {"message":"Created"}
  ```

- Vérification de l’ajout :
  
  ```sh
  $ curl -H 'Host: localhost' http://192.168.49.2:30164/city
  [{"id":1,"department_code":"01","insee_code":"01001","zip_code":"01400","name":"L Abergement-Clémenciat","lat":"46.15678","lon":"4.9246993"}]
  ```

## Metrics prometheus

Nous avons utilisé la lib [https://github.com/marcopacini/ts_prometheus](https://github.com/marcopacini/ts_prometheus) qui permet de gérer facilement les metrics.

Définition d’un compteur :

```ts
const counter = Counter.with({
    name: "http_requests_total",
    help: "The total HTTP requests",
    labels: ["path", "method", "status"],
});
```

Mise à jour d’un compteur :

```ts
counter
    .labels({
        path: ctx.request.url.pathname,
        method: ctx.request.method,
        status: ctx.response.status.toString() || "",
    })
    .inc();
```

Récupération des metrics générées :

```ts
Registry.default.metrics();
```
