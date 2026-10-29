# Projet Kubernetes sécurisé --- LabDockerCompose

> **À compléter avant remise :** vérifiez les intitulés exacts des
> exigences E1--E15 dans l'énoncé officiel, ajoutez vos propres captures
> et ne marquez une exigence comme validée qu'après avoir exécuté le
> test correspondant.

## 1. Présentation

Le projet déploie une application web composée d'un frontend, d'un
backend API et d'une base PostgreSQL sur un cluster K3s. Les objectifs
sont d'externaliser la configuration, protéger les secrets, conserver
les données après le remplacement d'un Pod, automatiser les sauvegardes,
limiter les flux réseau et vérifier les autorisations Kubernetes.

  -----------------------------------------------------------------------
  Élément                             Valeur
  ----------------------------------- -----------------------------------
  Cluster                             K3s

  Master                              `k3s-master` --- `192.168.199.10`

  Workers                             `k3s-worker1` --- `192.168.199.11`,
                                      `k3s-worker2` --- `192.168.199.12`

  Namespace                           `task-app`

  Base                                PostgreSQL 14

  URL de test                         `http://192.168.199.10/`

  Dépôt                               `MaramMiadi/LabDockerCompose`
  -----------------------------------------------------------------------

## 2. Architecture

``` mermaid
flowchart TB
    U[Utilisateur / navigateur] -->|HTTP :80| T[Traefik Ingress]
    T -->|TCP :8080| F[Frontend — 2 réplicas]
    F -->|TCP :3000| B[Backend API — 2 réplicas]
    B -->|TCP :5432| P[(PostgreSQL 14)]
    P --- PVC[(PVC postgres-data)]
    CM[ConfigMap task-app-config] -. paramètres .-> B
    S[Secret postgres-secret] -. identifiants .-> B
    S -. identifiants .-> CJ[CronJob postgres-backup]
    CM -. nom de base .-> CJ
    CJ -->|pg_dump :5432| P
    CJ -->|fichier SQL| BP[(PVC postgres-backup-data)]
```

  Composant                     Fonction
  ----------------------------- ----------------------------
  Traefik / Ingress             Point d'entrée HTTP
  Frontend                      Interface utilisateur
  Backend                       API et accès à la base
  PostgreSQL StatefulSet        Stockage relationnel
  `postgres-data` PVC           Persistance de la base
  `task-app-config` ConfigMap   Paramètres non sensibles
  `postgres-secret` Secret      Identifiants de base
  `postgres-backup` CronJob     Sauvegarde planifiée
  `postgres-backup-data` PVC    Fichiers SQL de sauvegarde
  NetworkPolicies               Contrôle des flux réseau

## 3. Commandes de vérification

``` bash
kubectl get nodes -o wide
kubectl get pods,svc,ingress,pvc -n task-app
kubectl get configmap task-app-config -n task-app
kubectl get secret postgres-secret -n task-app
kubectl get networkpolicy -n task-app
curl -i http://192.168.199.10/
```

Ne publiez jamais le contenu décodé d'un Secret, un mot de passe ou un
token GitHub dans les captures ou le dépôt.

## 4. Tableau des exigences E1 à E15

Les intitulés ci-dessous sont une **proposition de grille** fondée sur
les objectifs du projet. Remplacez-les par ceux de l'énoncé officiel si
nécessaire.

  ------------------------------------------------------------------------------------------------------------------
  Exigence          Résultat attendu    Preuve à joindre                                           Statut
  ----------------- ------------------- ---------------------------------------------------------- -----------------
  E1 ---            Frontend accessible `curl -i http://192.168.199.10/` + capture navigateur      À vérifier
  Application                                                                                      
  disponible                                                                                       

  E2 --- Namespace  Ressources dans     `kubectl get ns task-app`                                  À vérifier
  dédié             `task-app`                                                                     

  E3 ---            Paramètres dans     `kubectl describe configmap task-app-config -n task-app`   À vérifier
  Configuration     ConfigMap                                                                      
  externalisée                                                                                     

  E4 --- Secrets    Identifiants        `kubectl get secret postgres-secret -n task-app` +         À vérifier
  externalisés      référencés depuis   manifest expurgé                                           
                    Secret                                                                         

  E5 ---            PVC lié et monté    `kubectl get pvc -n task-app`                              À vérifier
  Persistance                                                                                      

  E6 --- Résilience Données conservées  Test de la section 7.1                                     À vérifier
  du Pod DB         après recréation du                                                            
                    Pod                                                                            

  E7 --- Sauvegarde CronJob planifié    `kubectl get cronjob,jobs -n task-app`                     À vérifier
  automatisée                                                                                      

  E8 --- Fichier de SQL présent sur le  Logs du Job + liste des fichiers                           À vérifier
  sauvegarde        PVC de sauvegarde                                                              

  E9 ---            Données restaurées  Import dans une base de test + résultat                    À vérifier
  Restauration      et vérifiées                                                                   

  E10 ---           Requests/limits     Inspection des Deployments et StatefulSet                  À vérifier
  Ressources        définis                                                                        
  maîtrisées                                                                                       

  E11 ---           `securityContext`   Inspection des manifests/Pods                              À vérifier
  Durcissement      appliqué lorsque                                                               
                    compatible                                                                     

  E12 ---           NetworkPolicies     `kubectl get networkpolicy -n task-app`                    À vérifier
  Politiques réseau présentes                                                                      

  E13 --- Flux      Frontend→backend et Test HTTP et logs                                          À vérifier
  autorisés         backend→DB                                                                     
                    fonctionnels                                                                   

  E14 --- Flux      Tentative non       Test de la section 6                                       À vérifier
  interdits         autorisée bloquée                                                              

  E15 --- RBAC      Droits vérifiés     Sorties de la section 9                                    À vérifier
                    avec `auth can-i`                                                              
  ------------------------------------------------------------------------------------------------------------------

Pour chaque exigence, ajouter une capture ou une sortie datée, lisible
et expurgée des informations sensibles.

## 5. Matrice des flux réseau

  --------------------------------------------------------------------------------
  Source             Destination    Port/protocole   Décision       Raison
                                                     attendue       
  ------------------ -------------- ---------------- -------------- --------------
  Client externe     Traefik        TCP 80           Autorisé       Accès HTTP

  Traefik            Frontend       TCP 8080         Autorisé       Routage
  (`kube-system`)                                                   Ingress

  Frontend           Backend        TCP 3000         Autorisé       Appels API
  (`app=frontend`)                                                  

  Backend            PostgreSQL     TCP 5432         Autorisé       Accès aux
  (`app=backend`)                                                   données

  Pod de sauvegarde  PostgreSQL     TCP 5432         Autorisé       `pg_dump`
  identifié                                                         

  Pods applicatifs   DNS cluster    UDP/TCP 53       Autorisé       Résolution des
                                                                    Services

  Pod non autorisé   PostgreSQL     TCP 5432         Bloqué         Réduire
                                                                    l'exposition

  Frontend           PostgreSQL     TCP 5432         Bloqué         Forcer le
                     directement                                    passage par
                                                                    l'API

  Pod non autorisé   Backend        TCP 3000         Bloqué sauf    Réduire
                                                     règle          l'exposition
                                                     explicite      
  --------------------------------------------------------------------------------

Politiques attendues : `allow-dns`, `frontend-policy`, `backend-policy`
et `postgres-policy`. Vérifiez les sélecteurs et les labels réellement
appliqués.

``` bash
kubectl get networkpolicy -n task-app
kubectl describe networkpolicy postgres-policy -n task-app
kubectl get cronjob postgres-backup -n task-app -o yaml
kubectl get pods -n task-app --show-labels
```

**Point important :** le label autorisé par `postgres-policy` doit
réellement exister sur le Pod généré par le CronJob. Une connexion qui
échoue ne prouve pas à elle seule que la NetworkPolicy est responsable ;
vérifiez aussi les événements, les logs et le fonctionnement du flux
autorisé.

## 6. Tests de blocage réseau

### Flux autorisé : frontend vers backend

Si `wget` est présent dans l'image frontend :

``` bash
kubectl exec -n task-app deploy/frontend -- wget -qO- http://backend:3000/health
```

Résultat attendu : réponse positive de l'endpoint de santé.

### Flux interdit : Pod non autorisé vers PostgreSQL

Dans un environnement de test, utiliser un Pod de diagnostic sans label
autorisé par `postgres-policy` :

``` bash
kubectl run postgres-denied-test -n task-app --rm -it \
  --restart=Never --image=postgres:14 \
  --command -- sh -c 'pg_isready -h postgres -p 5432'
```

Résultat attendu : échec depuis le Pod non autorisé, alors que le
backend autorisé peut toujours accéder à la base. Le résultat peut être
un délai d'attente ou un échec de connexion selon le CNI et les règles.
Si la politique Pod Security refuse le Pod de diagnostic, utiliser un
Pod de test conforme aux règles du cluster.

## 7. Persistance, sauvegarde et restauration

### 7.1 Démontrer la persistance

1.  Créer une donnée identifiable dans l'application, par exemple
    `PERSISTENCE-TEST-<date>`.

2.  Vérifier qu'elle est visible.

3.  Vérifier le PVC et le Pod :

    ``` bash
    kubectl get pvc -n task-app
    kubectl get pod postgres-0 -n task-app -o wide
    ```

4.  Supprimer uniquement le Pod :

    ``` bash
    kubectl delete pod postgres-0 -n task-app
    ```

5.  Attendre le retour du Pod :

    ``` bash
    kubectl get pods -n task-app -w
    ```

6.  Vérifier que la donnée est toujours présente et enregistrer une
    capture.

**Ne supprimez jamais `postgres-data`, le PVC de base ou le StatefulSet
pour ce test.**

### 7.2 Démontrer la sauvegarde

``` bash
kubectl get cronjob postgres-backup -n task-app
kubectl describe cronjob postgres-backup -n task-app
kubectl create job postgres-backup-manual-$(date +%s) --from=cronjob/postgres-backup -n task-app
kubectl get jobs,pods -n task-app
```

Consulter les logs avec le nom réel du Job :

``` bash
kubectl logs job/<NOM_DU_JOB> -n task-app
```

Vérifier ensuite que le fichier SQL est présent sur
`postgres-backup-data`, et relever son nom et sa taille. La
planification configurée est quotidienne à 02:00 ; vérifier le fuseau
horaire effectif avant d'interpréter l'heure d'exécution.

### 7.3 Démontrer la restauration

Effectuer d'abord la restauration dans une base de test isolée, jamais
directement dans `todo_db` pour la démonstration.

1.  Identifier le fichier SQL et vérifier qu'il n'est pas vide.
2.  Créer une base de test vide, par exemple `todo_restore_test`.
3.  Exécuter `psql` depuis un conteneur disposant du client et du
    fichier SQL monté.
4.  Vérifier les tables et les données restaurées.
5.  Capturer les résultats en masquant les informations sensibles.

Commande indicative à adapter au chemin et au contexte d'exécution :

``` bash
psql -h postgres -U "$POSTGRES_USER" -d todo_restore_test -f /chemin/vers/sauvegarde.sql
```

## 8. Sécurité et durcissement

Mesures à vérifier dans les manifests réellement appliqués :

-   Paramètres non sensibles dans ConfigMap ; identifiants dans Secret.
-   Accès aux Secrets limité par RBAC. Le base64 d'un Secret Kubernetes
    n'est pas, à lui seul, un chiffrement.
-   PVC distinct pour les données PostgreSQL et PVC dédié aux
    sauvegardes.
-   CronJob avec politique de rétention des fichiers anciens, selon la
    configuration du projet.
-   NetworkPolicies limitant les flux nécessaires.
-   `resources.requests` et `resources.limits` pour les conteneurs.
-   Quand l'image le permet : `runAsNonRoot`,
    `allowPrivilegeEscalation: false`, `readOnlyRootFilesystem: true`,
    `seccompProfile: RuntimeDefault` et `capabilities.drop: ["ALL"]`.
-   Images à versions explicites et droits minimaux pour les comptes de
    service.

### Justifications des exceptions

Documenter uniquement les exceptions réellement présentes :

  -----------------------------------------------------------------------
  Exception éventuelle    Justification à         Mesure compensatoire
                          confirmer               
  ----------------------- ----------------------- -----------------------
  Système de fichiers     L'application écrit     Monter des volumes sur
  racine en écriture      dans certains chemins   les seuls chemins
                                                  nécessaires et
                                                  réévaluer l'image

  Exécution en root       Une initialisation      Préférer un UID non
                          exige des privilèges    privilégié et limiter
                                                  les capacités

  Capacités Linux         Fonction explicitement  Garder uniquement la
  conservées              dépendante              capacité nécessaire

  Flux réseau             Dépendance identifiée   Limiter source,
  supplémentaire                                  destination et port

  Image incompatible avec Limitation connue de    Épingler la version,
  un réglage              l'image                 limiter les droits et
                                                  planifier une image
                                                  compatible
  -----------------------------------------------------------------------

Si aucune exception n'est nécessaire, indiquez-le seulement après
inspection des manifests.

## 9. Vérification RBAC avec `auth can-i`

``` bash
kubectl auth can-i get pods -n task-app
kubectl auth can-i delete pods -n task-app
kubectl auth can-i get secrets -n task-app
kubectl auth can-i create jobs -n task-app
kubectl auth can-i --list -n task-app
```

`yes` signifie que l'identité courante est autorisée ; `no` signifie
qu'elle ne l'est pas. Le résultat dépend du compte utilisé : un test
avec un compte administrateur ne prouve pas que les comptes applicatifs
ont des droits limités.

Pour tester un compte de service spécifique, si les permissions le
permettent :

``` bash
kubectl auth can-i get pods -n task-app \
  --as=system:serviceaccount:task-app:<NOM_SERVICE_ACCOUNT>
```

Remplacer `<NOM_SERVICE_ACCOUNT>` par le nom réel et conserver les
sorties des tests.

## 10. Réponses aux questions des phases

> Insérer ici les questions exactes de l'énoncé. Les réponses suivantes
> sont des axes à adapter aux résultats observés.

**Pourquoi séparer ConfigMap et Secret ?**\
La ConfigMap contient les paramètres non sensibles ; le Secret est
destiné aux informations sensibles. Les deux externalisent la
configuration, mais les Secrets nécessitent aussi un contrôle d'accès et
une protection adaptée du cluster.

**Pourquoi les données survivent-elles au remplacement du Pod ?**\
Le Pod est remplaçable tandis que les données sont stockées sur un
volume persistant. La conservation dépend du PVC et du volume
sous-jacent ; la suppression du PVC peut entraîner une perte de données
selon la politique de stockage.

**Pourquoi un PVC ne remplace-t-il pas une sauvegarde ?**\
Le PVC assure la persistance, mais ne protège pas nécessairement contre
une suppression accidentelle, une corruption ou la perte du volume. Une
sauvegarde indépendante et une restauration testée sont nécessaires.

**Comment prouver qu'une sauvegarde est valide ?**\
Vérifier le fichier, sa taille, puis restaurer dans une base de test et
contrôler les données.

**Pourquoi une matrice de flux réseau ?**\
Elle identifie les communications nécessaires afin d'autoriser les
dépendances utiles et de bloquer les accès non requis.

**Que prouve un test de blocage ?**\
Le flux interdit échoue tandis que le flux autorisé fonctionne. Un échec
isolé ne prouve pas que la NetworkPolicy est la cause ; il faut
contrôler la disponibilité du service et les événements réseau.

**Pourquoi requests et limits ?**\
Les requests aident l'ordonnanceur à réserver les ressources ; les
limits plafonnent la consommation du conteneur.

**Pourquoi le moindre privilège ?**\
Chaque identité ne reçoit que les autorisations nécessaires, ce qui
réduit les conséquences d'une compromission.

## 11. Difficultés rencontrées et enseignements

Décrivez les incidents réellement observés : configuration GitHub,
validation YAML, accès réseau du Job de sauvegarde, récupération des
logs ou contrôle RBAC. Pour chacun, préciser le symptôme, le diagnostic,
la correction et la preuve du résultat.

Un enseignement essentiel est qu'un manifeste présent ne suffit pas à
prouver qu'un service fonctionne. Il faut vérifier les labels et
sélecteurs, tester les chemins réseau réels, examiner les événements et
logs, puis tester la restauration d'une sauvegarde. La persistance doit
être démontrée en supprimant uniquement le Pod, sans supprimer le PVC
qui contient les données.

À personnaliser : - Problème réel : `[description]` - Diagnostic :
`[commandes et observations]` - Correction : `[modification]` - Résultat
: `[preuve]` - Enseignement : `[conclusion]`

## 12. Démonstration orale --- 10 minutes

  --------------------------------------------------------------------------
  Temps                   Étape                   Démonstration
  ----------------------- ----------------------- --------------------------
  0:00--1:00              Architecture            Présenter le schéma et les
                                                  composants

  1:00--2:00              Application             Ouvrir
                                                  `http://192.168.199.10/`
                                                  et afficher une donnée

  2:00--3:30              Persistance             Montrer le PVC, supprimer
                                                  `postgres-0`, attendre le
                                                  retour et vérifier la
                                                  donnée

  3:30--5:30              Sauvegarde              Montrer le CronJob, les
                                                  logs du Job et le fichier
                                                  SQL

  5:30--7:00              Restauration            Restaurer dans une base
                                                  isolée et vérifier les
                                                  données

  7:00--8:15              NetworkPolicy           Montrer les règles, un
                                                  flux autorisé et une
                                                  tentative bloquée

  8:15--9:15              RBAC                    Exécuter
                                                  `kubectl auth can-i` et
                                                  expliquer `yes`/`no`

  9:15--10:00             Conclusion              Résumer les protections et
                                                  les limites restantes
  --------------------------------------------------------------------------

Commandes utiles pendant la démonstration :

``` bash
kubectl get nodes -o wide
kubectl get pods,svc,ingress,pvc -n task-app
kubectl delete pod postgres-0 -n task-app
kubectl get pods -n task-app -w
kubectl get cronjob,jobs -n task-app
kubectl get networkpolicy -n task-app
kubectl auth can-i get pods -n task-app
kubectl auth can-i delete pods -n task-app
kubectl auth can-i get secrets -n task-app
```

Préparer les captures et une sauvegarde valide avant l'oral ; ne pas
dépendre uniquement d'une exécution en direct.

## 13. Checklist avant remise

-   [ ] Les exigences E1--E15 correspondent à l'énoncé officiel.
-   [ ] Chaque exigence a une preuve datée et lisible.
-   [ ] Le schéma correspond à l'architecture réelle.
-   [ ] Les flux autorisés et interdits ont été testés.
-   [ ] La persistance est vérifiée après suppression du Pod PostgreSQL.
-   [ ] Une sauvegarde SQL a été créée et vérifiée.
-   [ ] Une restauration a été testée dans une base isolée.
-   [ ] Les exceptions de durcissement sont documentées et réelles.
-   [ ] Les tests `kubectl auth can-i` ont été exécutés avec l'identité
    pertinente.
-   [ ] Aucun mot de passe, Secret décodé ou token n'apparaît dans le
    dépôt ou les captures.
-   [ ] Les captures sont rangées dans `captures/`.

**Auteur :** Maram Miadi\
**Projet :** LabDockerCompose --- sécurisation d'une application sur
K3s\
**Date :** `[JJ/MM/AAAA]`
