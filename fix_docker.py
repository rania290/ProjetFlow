import os

path = r'C:\Users\rania\vaerdia\docker-compose.yml'
with open(path, 'r') as f:
    lines = f.readlines()

# Find the line with "volumes:"
volumes_idx = -1
for i, line in enumerate(lines):
    if line.strip() == 'volumes:':
        volumes_idx = i
        break

if volumes_idx != -1:
    # Keep everything before volumes
    new_lines = lines[:volumes_idx]
    
    # Add MinIO service
    new_lines.append("\n  minio:\n")
    new_lines.append("    image: minio/minio\n")
    new_lines.append("    container_name: vaerdia-minio\n")
    new_lines.append("    ports:\n")
    new_lines.append('      - "9000:9000"\n')
    new_lines.append('      - "9001:9001"\n')
    new_lines.append("    environment:\n")
    new_lines.append("      MINIO_ROOT_USER: admin\n")
    new_lines.append("      MINIO_ROOT_PASSWORD: password123\n")
    new_lines.append("    volumes:\n")
    new_lines.append("      - minio_data:/data\n")
    new_lines.append('    command: server /data --console-address ":9001"\n')
    
    # Add volumes section
    new_lines.append("\nvolumes:\n")
    new_lines.append("  postgres_data:\n")
    new_lines.append("  minio_data:\n")
    
    with open(path, 'w') as f:
        f.writelines(new_lines)
    print("Successfully updated docker-compose.yml")
else:
    print("Could not find volumes: section")
