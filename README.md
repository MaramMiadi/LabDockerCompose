# Lab Docker Compose

## Captures d'Écran Obligatoires

Voici les captures d'écran requises pour ce lab. (Placez vos images dans un dossier `/screenshots/` ou intégrez-les directement ici) :

### 1. docker-compose ps montrant tous les services "Up" et "healthy"
![docker-compose ps](./screenshots/1_docker-compose_ps.png)

### 2. docker network ls montrant vos deux réseaux
![docker network ls](./screenshots/2_docker_network_ls.png)

### 3. docker volume ls montrant votre volume de données
![docker volume ls](./screenshots/3_docker_volume_ls.png)

### 4. docker stats montrant les limites de ressources appliquées
![docker stats](./screenshots/4_docker_stats.png)

### 5. Interface frontend fonctionnelle affichant des données
![Interface frontend](./screenshots/5_frontend_interface.png)

### 6. Test d'ajout de données via l'interface
![Test d'ajout de données](./screenshots/6_add_data_test.png)

### 7. Logs démontrant la connexion backend → database
![Logs connexion backend db](./screenshots/7_backend_db_logs.png)

### 8. Test de l'isolation réseau (échec de connexion frontend → database)
![Test isolation réseau](./screenshots/8_network_isolation_test.png)

### 9. Health check status dans docker inspect
![Health check status](./screenshots/9_health_check_status.png)

### 10. Comparaison de taille d'image (backend avec/sans multi-stage si possible)
![Comparaison taille image](./screenshots/10_image_size_comparison.png)
