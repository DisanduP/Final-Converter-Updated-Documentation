# Migration

This folder contains comprehensive guides and tools for migrating to and upgrading the Mermaid to Draw.io Converter.

## Available Guides

### [MIGRATION-GUIDE.md](MIGRATION-GUIDE.md)
Complete migration guide covering:
- Version upgrades (v1.x → v2.x → v3.x)
- Tool migration from Draw.io, PlantUML, Graphviz, Visio, Lucidchart, Gliffy
- Cloud migration (self-hosted to cloud providers)
- Database migration (MongoDB to PostgreSQL)
- Testing and validation strategies

### [VERSION-UPGRADE-GUIDE.md](VERSION-UPGRADE-GUIDE.md)
Detailed version upgrade instructions:
- Step-by-step upgrade procedures
- Breaking changes and compatibility notes
- Automated upgrade scripts
- Rollback procedures
- Troubleshooting common issues

### [TOOL-MIGRATION-GUIDE.md](TOOL-MIGRATION-GUIDE.md)
Tool-specific migration guides:
- Draw.io to Mermaid conversion
- PlantUML migration with syntax mapping
- Graphviz DOT format conversion
- Microsoft Visio migration (limited support)
- Lucidchart and Gliffy migration
- Batch migration tools and validation

### [DATA-MIGRATION-GUIDE.md](DATA-MIGRATION-GUIDE.md)
Data migration between storage systems:
- Database migration (MongoDB ↔ PostgreSQL, MySQL → PostgreSQL)
- File system migration (local → cloud storage)
- Cloud-to-cloud migration (AWS S3 → Google Cloud Storage)
- Configuration migration
- API data migration (REST → GraphQL)
- Backup and recovery procedures

## Quick Start

### For Version Upgrades
```bash
# Check current version
npm list @mermaid/converter

# Upgrade to latest
npm update @mermaid/converter

# Run upgrade script
./upgrade.sh
```

### For Tool Migration
```bash
# Batch convert Draw.io files
./universal-migrate.sh batch ./drawio-files ./mermaid-files

# Convert single PlantUML file
node plantuml-converter.js input.puml output.mmd
```

### For Data Migration
```bash
# Database migration
node mongodb-to-postgres.js

# File system migration
node local-to-s3.js
```

## Migration Checklist

### Pre-Migration
- [ ] Backup all data and configurations
- [ ] Test migration scripts in staging environment
- [ ] Document current system state
- [ ] Plan rollback procedures
- [ ] Schedule maintenance window

### During Migration
- [ ] Stop services before migration
- [ ] Run migration scripts with monitoring
- [ ] Validate data integrity at each step
- [ ] Update configurations
- [ ] Test functionality

### Post-Migration
- [ ] Verify all features work correctly
- [ ] Update documentation and references
- [ ] Train users on new features
- [ ] Monitor system performance
- [ ] Plan for future upgrades

## Support

For migration assistance:
- **Documentation**: Refer to specific guide for your migration type
- **Community**: GitHub Discussions for migration questions
- **Professional Services**: Contact enterprise support for complex migrations
- **Bug Reports**: GitHub Issues for migration tool problems

## Migration Tools

### Automated Scripts
- `upgrade.sh` - Automated version upgrade
- `universal-migrate.sh` - Batch tool migration
- `backup.sh` / `restore.sh` - Data backup and recovery

### Node.js Modules
- `plantuml-converter.js` - PlantUML to Mermaid conversion
- `dot-converter.js` - Graphviz DOT conversion
- `visio-converter.js` - Visio migration (limited)
- `mongodb-to-postgres.js` - Database migration
- `local-to-s3.js` - File system to cloud migration

### Validation Tools
- `migration-validator.js` - Validate converted diagrams
- `migration-tracker.js` - Track migration progress
- `integrity-check.js` - Data integrity verification
- `migration-monitor.js` - Performance monitoring

## Best Practices

1. **Always backup before migrating**
2. **Test migrations in staging first**
3. **Use batch processing for large datasets**
4. **Validate data integrity throughout**
5. **Have rollback plans ready**
6. **Monitor performance during migration**
7. **Document all changes and issues**

## Common Issues

### Version Upgrades
- **Module not found**: Clear node_modules and reinstall
- **Database connection errors**: Update connection strings
- **Authentication failures**: Regenerate JWT secrets

### Tool Migration
- **Invalid format errors**: Check file encodings
- **Missing conversions**: Review error logs
- **Performance issues**: Process in smaller batches

### Data Migration
- **Memory issues**: Use streaming for large datasets
- **Connection timeouts**: Implement retry logic
- **Data corruption**: Validate with checksums

Remember: Migration is a significant change. Plan carefully, test thoroughly, and always have a backup and rollback strategy.
