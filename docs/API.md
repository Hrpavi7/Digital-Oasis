# Digital Oasis API Documentation

## Overview

The Digital Oasis API provides comprehensive endpoints for PC organization, file analysis, cleaning automation, and gamification features. This documentation covers all available endpoints, request/response formats, and integration guidelines.

## Base URL

```
https://api.base44.com/v1
```

## Authentication

All API requests require authentication using Bearer tokens in the Authorization header:

```http
Authorization: Bearer YOUR_API_TOKEN
```

## Core Endpoints

### File System Analysis

#### Scan PC Files
```http
POST /scan
```

Initiates a comprehensive scan of the user's PC file system.

**Request Body:**
```json
{
  "scan_type": "full|quick|custom",
  "target_directories": ["/path/to/directory"],
  "file_types": ["documents", "images", "videos", "applications"],
  "include_hidden": true,
  "max_file_size": "100MB"
}
```

**Response:**
```json
{
  "scan_id": "scan_123456",
  "status": "in_progress",
  "progress": 0,
  "estimated_completion": "2024-01-15T10:30:00Z",
  "files_found": 0,
  "total_size": "0GB"
}
```

#### Get Scan Results
```http
GET /scan/{scan_id}
```

Retrieves detailed results from a completed scan.

**Response:**
```json
{
  "scan_id": "scan_123456",
  "status": "completed",
  "progress": 100,
  "files_analyzed": 15420,
  "total_size": "45.3GB",
  "duplicate_files": 342,
  "large_files": 23,
  "temporary_files": 1250,
  "unused_applications": 8,
  "recommendations": [
    {
      "type": "cleanup",
      "description": "Remove 342 duplicate files to free up 2.1GB",
      "priority": "high",
      "estimated_savings": "2.1GB"
    }
  ]
}
```

### File Organization

#### Analyze File Content
```http
POST /files/analyze
```

Analyzes file content to suggest optimal organization and categorization.

**Request Body:**
```json
{
  "file_path": "/path/to/file.pdf",
  "file_type": "document",
  "metadata": {
    "size": 2457600,
    "created": "2024-01-01T10:00:00Z",
    "modified": "2024-01-10T15:30:00Z"
  }
}
```

**Response:**
```json
{
  "file_id": "file_789012",
  "suggested_category": "work/documents/reports",
  "confidence": 0.92,
  "tags": ["financial", "quarterly", "report"],
  "recommended_name": "Q4_2023_Financial_Report.pdf",
  "duplicate_score": 0.15,
  "organization_priority": "high"
}
```

#### Smart Rename Suggestions
```http
POST /files/rename-suggestions
```

Generates intelligent file renaming suggestions based on content analysis.

**Request Body:**
```json
{
  "files": [
    {
      "path": "/path/to/document1.pdf",
      "current_name": "doc1.pdf"
    }
  ],
  "naming_convention": "date_first|category_first|descriptive"
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "original_path": "/path/to/document1.pdf",
      "suggested_name": "2024-01-15_Project_Proposal.pdf",
      "confidence": 0.88,
      "reasoning": "Based on document content and creation date"
    }
  ]
}
```

### Cleaning & Optimization

#### Create Cleaning Rule
```http
POST /cleaning/rules
```

Creates automated cleaning rules for file maintenance.

**Request Body:**
```json
{
  "rule_name": "Temporary Files Cleanup",
  "description": "Remove temporary files older than 30 days",
  "conditions": {
    "file_extensions": [".tmp", ".temp", ".log"],
    "min_age_days": 30,
    "max_size_mb": 100,
    "locations": ["/temp", "/downloads"]
  },
  "actions": {
    "action_type": "delete",
    "backup_before_delete": true,
    "confirm_deletion": false
  },
  "schedule": {
    "frequency": "weekly",
    "day_of_week": "sunday",
    "time": "02:00"
  }
}
```

**Response:**
```json
{
  "rule_id": "rule_345678",
  "status": "active",
  "created_at": "2024-01-15T10:00:00Z",
  "last_executed": null,
  "next_execution": "2024-01-21T02:00:00Z"
}
```

#### Execute Cleaning Rule
```http
POST /cleaning/rules/{rule_id}/execute
```

Manually executes a cleaning rule.

**Response:**
```json
{
  "execution_id": "exec_901234",
  "rule_id": "rule_345678",
  "status": "completed",
  "files_processed": 125,
  "files_deleted": 89,
  "space_freed": "1.2GB",
  "backup_created": "backup_20240115_100000",
  "errors": []
}
```

#### Get Large Files
```http
GET /files/large-files
```

Retrieves a list of large files consuming significant storage space.

**Query Parameters:**
- `min_size_mb`: Minimum file size in megabytes (default: 100)
- `limit`: Maximum number of results (default: 50)

**Response:**
```json
{
  "large_files": [
    {
      "path": "/videos/vacation_2023.mp4",
      "size": "2.1GB",
      "type": "video",
      "last_accessed": "2023-08-15T14:30:00Z",
      "recommendation": "Consider archiving or deleting"
    }
  ],
  "total_size": "45.2GB",
  "potential_savings": "23.1GB"
}
```

### Backup Management

#### Create Backup Configuration
```http
POST /backup/configurations
```

Creates automated backup configurations for important files.

**Request Body:**
```json
{
  "config_name": "Important Documents Backup",
  "source_paths": ["/documents", "/desktop/important"],
  "file_types": [".pdf", ".docx", ".xlsx"],
  "backup_location": "/backup/documents",
  "schedule": {
    "frequency": "daily",
    "time": "03:00"
  },
  "retention_policy": {
    "keep_versions": 5,
    "max_age_days": 30
  }
}
```

**Response:**
```json
{
  "config_id": "config_567890",
  "status": "active",
  "last_backup": null,
  "next_backup": "2024-01-16T03:00:00Z"
}
```

#### Get Backup History
```http
GET /backup/history
```

Retrieves backup execution history.

**Response:**
```json
{
  "backups": [
    {
      "backup_id": "backup_20240115_030000",
      "config_id": "config_567890",
      "status": "completed",
      "files_backed_up": 245,
      "total_size": "1.2GB",
      "duration": "00:02:30",
      "backup_location": "/backup/documents/2024-01-15"
    }
  ]
}
```

### Gamification System

#### Get User Achievements
```http
GET /gamification/achievements
```

Retrieves user's earned achievements and progress.

**Response:**
```json
{
  "user_id": "user_123456",
  "total_points": 2450,
  "level": "Organization Expert",
  "achievements": [
    {
      "achievement_id": "achievement_123",
      "name": "Clean Sweep",
      "description": "Clean up 1GB of files in a single session",
      "points": 100,
      "earned_at": "2024-01-14T15:30:00Z",
      "icon": "🧹"
    }
  ],
  "next_milestone": {
    "name": "Storage Master",
    "points_required": 3000,
    "progress": 81.7
  }
}
```

#### Get Active Challenges
```http
GET /gamification/challenges
```

Retrieves currently active challenges for the user.

**Response:**
```json
{
  "challenges": [
    {
      "challenge_id": "challenge_789012",
      "name": "Weekly Cleanup Warrior",
      "description": "Clean up 500MB of files this week",
      "type": "weekly",
      "progress": 350,
      "target": 500,
      "deadline": "2024-01-21T23:59:59Z",
      "reward": {
        "points": 200,
        "badge": "Cleanup Warrior"
      }
    }
  ]
}
```

#### Update Challenge Progress
```http
POST /gamification/challenges/{challenge_id}/progress
```

Updates progress for an active challenge.

**Request Body:**
```json
{
  "progress_increment": 150,
  "action_type": "file_cleanup",
  "metadata": {
    "files_cleaned": 25,
    "space_freed": "150MB"
  }
}
```

**Response:**
```json
{
  "challenge_id": "challenge_789012",
  "progress": 500,
  "completed": true,
  "points_earned": 200,
  "new_achievements": ["Cleanup Warrior"]
}
```

### AI Assistant

#### Chat with AI Assistant
```http
POST /ai/chat
```

Interacts with the AI assistant for file organization help.

**Request Body:**
```json
{
  "message": "How can I organize my download folder?",
  "context": {
    "current_page": "organize",
    "recent_actions": ["scanned_downloads"]
  }
}
```

**Response:**
```json
{
  "response": "I can help you organize your downloads! Based on your scan, I found 156 files. I recommend creating folders by file type: Documents, Images, Videos, and Applications. Would you like me to suggest specific organization rules?",
  "suggestions": [
    "Create folders by file type",
    "Sort by date modified",
    "Remove duplicate downloads"
  ],
  "confidence": 0.92
}
```

## Error Handling

All API responses follow a consistent error format:

```json
{
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "The requested file could not be found",
    "details": {
      "file_path": "/path/to/file.pdf"
    }
  }
}
```

### Common Error Codes

- `400` - Bad Request: Invalid request parameters
- `401` - Unauthorized: Missing or invalid authentication
- `403` - Forbidden: Insufficient permissions
- `404` - Not Found: Resource not found
- `429` - Rate Limited: Too many requests
- `500` - Internal Server Error: Server-side error

## Rate Limiting

API requests are rate-limited to ensure fair usage:

- **Standard requests**: 100 requests per minute
- **File upload requests**: 10 requests per minute
- **Scan operations**: 5 concurrent scans per user

## Webhooks

Digital Oasis supports webhooks for real-time notifications:

### Scan Completion Webhook
```json
{
  "event": "scan.completed",
  "scan_id": "scan_123456",
  "user_id": "user_789012",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "status": "completed",
    "files_analyzed": 15420,
    "recommendations_count": 15
  }
}
```

### Challenge Completed Webhook
```json
{
  "event": "challenge.completed",
  "challenge_id": "challenge_789012",
  "user_id": "user_123456",
  "timestamp": "2024-01-15T14:30:00Z",
  "data": {
    "challenge_name": "Weekly Cleanup Warrior",
    "points_earned": 200
  }
}
```

## SDK Integration

The Digital Oasis API can be accessed through the official Base44 SDK:

```javascript
import { Base44Client } from '@base44/sdk';

const client = new Base44Client({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Start a PC scan
const scanResult = await client.scan.start({
  scanType: 'full',
  targetDirectories: ['/downloads', '/documents']
});

// Get cleaning recommendations
const recommendations = await client.cleaning.getRecommendations();
```

## Support

For API support and questions:
- Email: api-support@digitaloasis.com
- Documentation: https://docs.digitaloasis.com
- Status Page: https://status.digitaloasis.com