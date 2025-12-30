# Platform Integrations

This guide covers integrating the Mermaid to Draw.io Converter with popular platforms, tools, and services.

## Documentation Platforms

### GitBook

#### Setup
1. Create a GitBook integration webhook
2. Configure the converter API endpoint
3. Set up automatic diagram conversion

#### Integration Script
```javascript
// gitbook-integration.js
const axios = require('axios');

class GitBookIntegration {
  constructor(apiKey, webhookSecret) {
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
    this.converterUrl = 'https://api.mermaid-converter.com/v1';
  }

  async handleWebhook(payload, signature) {
    // Verify webhook signature
    if (!this.verifySignature(payload, signature)) {
      throw new Error('Invalid webhook signature');
    }

    const { action, page, space } = payload;

    if (action === 'page.updated') {
      await this.convertDiagramsInPage(page);
    }
  }

  async convertDiagramsInPage(page) {
    const content = await this.getPageContent(page.id);
    const convertedContent = await this.convertMermaidDiagrams(content);
    await this.updatePageContent(page.id, convertedContent);
  }

  async convertMermaidDiagrams(content) {
    const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
    let convertedContent = content;
    let match;

    while ((match = mermaidRegex.exec(content)) !== null) {
      const mermaidCode = match[1];

      try {
        const response = await axios.post(`${this.converterUrl}/convert`, {
          mermaid: mermaidCode,
          format: 'svg'
        }, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        const svgContent = response.data.data.content;
        convertedContent = convertedContent.replace(
          match[0],
          `![Diagram](${svgContent})`
        );
      } catch (error) {
        console.error('Failed to convert diagram:', error);
      }
    }

    return convertedContent;
  }

  verifySignature(payload, signature) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}
```

### Notion

#### Setup Integration
1. Create a Notion integration
2. Get the integration token
3. Configure page access permissions

#### Notion API Integration
```javascript
// notion-integration.js
const { Client } = require('@notionhq/client');

class NotionIntegration {
  constructor(notionToken, converterApiKey) {
    this.notion = new Client({ auth: notionToken });
    this.converterApiKey = converterApiKey;
  }

  async convertPageDiagrams(pageId) {
    // Get page blocks
    const blocks = await this.notion.blocks.children.list({
      block_id: pageId
    });

    for (const block of blocks.results) {
      if (block.type === 'code' && block.code.language === 'mermaid') {
        await this.convertMermaidBlock(block);
      }
    }
  }

  async convertMermaidBlock(block) {
    try {
      const response = await axios.post('https://api.mermaid-converter.com/v1/convert', {
        mermaid: block.code.rich_text[0].plain_text,
        format: 'png'
      }, {
        headers: {
          'Authorization': `Bearer ${this.converterApiKey}`,
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer'
      });

      // Upload image to Notion
      const imageUrl = await this.uploadImageToNotion(response.data);

      // Replace code block with image
      await this.notion.blocks.update({
        block_id: block.id,
        image: {
          type: 'external',
          external: { url: imageUrl }
        }
      });
    } catch (error) {
      console.error('Failed to convert Notion diagram:', error);
    }
  }
}
```

### Confluence

#### Setup
1. Create a Confluence app
2. Configure webhooks for page updates
3. Set up API permissions

#### Confluence Integration
```javascript
// confluence-integration.js
const axios = require('axios');

class ConfluenceIntegration {
  constructor(confluenceUrl, username, apiToken, converterApiKey) {
    this.baseUrl = confluenceUrl;
    this.auth = Buffer.from(`${username}:${apiToken}`).toString('base64');
    this.converterApiKey = converterApiKey;
  }

  async convertPageDiagrams(pageId) {
    const page = await this.getPage(pageId);
    const convertedContent = await this.convertMermaidInContent(page.body.storage.value);
    await this.updatePage(pageId, convertedContent);
  }

  async convertMermaidInContent(content) {
    const mermaidRegex = /<ac:structured-macro[^>]*ac:name="mermaid"[^>]*>([\s\S]*?)<\/ac:structured-macro>/g;
    let convertedContent = content;
    let match;

    while ((match = mermaidRegex.exec(content)) !== null) {
      const mermaidCode = this.extractMermaidCode(match[1]);

      try {
        const response = await axios.post('https://api.mermaid-converter.com/v1/convert', {
          mermaid: mermaidCode,
          format: 'svg'
        }, {
          headers: {
            'Authorization': `Bearer ${this.converterApiKey}`,
            'Content-Type': 'application/json'
          }
        });

        const svgContent = response.data.data.content;
        convertedContent = convertedContent.replace(
          match[0],
          `<ac:image><ri:attachment ri:filename="diagram.svg"><ri:content-type>image/svg+xml</ri:content-type></ri:attachment></ac:image>`
        );
      } catch (error) {
        console.error('Failed to convert Confluence diagram:', error);
      }
    }

    return convertedContent;
  }
}
```

## Development Tools

### VS Code Extension

#### Extension Structure
```
vscode-mermaid-converter/
├── package.json
├── src/
│   ├── extension.ts
│   ├── converter.ts
│   └── utils.ts
├── media/
│   └── icon.png
└── test/
    └── runTest.ts
```

#### package.json
```json
{
  "name": "mermaid-converter",
  "displayName": "Mermaid to Draw.io Converter",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.70.0"
  },
  "categories": ["Other"],
  "activationEvents": ["onCommand:mermaidConverter.convert"],
  "main": "./out/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "mermaidConverter.convert",
        "title": "Convert Mermaid to Draw.io"
      }
    ],
    "menus": {
      "editor/context": [
        {
          "command": "mermaidConverter.convert",
          "when": "editorTextFocus && editorLangId == mermaid"
        }
      ]
    }
  },
  "scripts": {
    "vscode:prepublish": "npm run compile",
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./"
  },
  "dependencies": {
    "axios": "^1.3.0"
  },
  "devDependencies": {
    "@types/vscode": "^1.70.0",
    "@types/node": "^18.0.0",
    "typescript": "^4.8.0"
  }
}
```

#### Extension Code
```typescript
// src/extension.ts
import * as vscode from 'vscode';
import { Converter } from './converter';

export function activate(context: vscode.ExtensionContext) {
  const converter = new Converter();

  const convertCommand = vscode.commands.registerCommand(
    'mermaidConverter.convert',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active editor');
        return;
      }

      const document = editor.document;
      if (document.languageId !== 'mermaid') {
        vscode.window.showErrorMessage('File is not a Mermaid diagram');
        return;
      }

      const mermaidCode = document.getText();

      try {
        vscode.window.showInformationMessage('Converting diagram...');

        const result = await converter.convertToDrawio(mermaidCode);

        // Create new document with Draw.io content
        const drawioDoc = await vscode.workspace.openTextDocument({
          content: result.content,
          language: 'xml'
        });

        await vscode.window.showTextDocument(drawioDoc);

        vscode.window.showInformationMessage('Diagram converted successfully!');
      } catch (error) {
        vscode.window.showErrorMessage(`Conversion failed: ${error.message}`);
      }
    }
  );

  context.subscriptions.push(convertCommand);
}
```

#### Converter Implementation
```typescript
// src/converter.ts
import axios from 'axios';

export class Converter {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = vscode.workspace.getConfiguration('mermaidConverter').get('apiKey', '');
    this.baseUrl = 'https://api.mermaid-converter.com/v1';
  }

  async convertToDrawio(mermaidCode: string) {
    if (!this.apiKey) {
      throw new Error('API key not configured. Please set mermaidConverter.apiKey in settings.');
    }

    const response = await axios.post(`${this.baseUrl}/convert`, {
      mermaid: mermaidCode,
      format: 'drawio'
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.data;
  }
}
```

### JetBrains IDE Plugin

#### Plugin Structure
```
intellij-mermaid-converter/
├── src/main/
│   ├── kotlin/
│   │   └── com/mermaid/converter/
│   │       ├── MermaidConverter.kt
│   │       ├── ConverterAction.kt
│   │       └── settings/Settings.kt
│   └── resources/
│       └── META-INF/
│           └── plugin.xml
├── gradle.properties
└── build.gradle.kts
```

#### plugin.xml
```xml
<idea-plugin>
    <id>com.mermaid.converter</id>
    <name>Mermaid to Draw.io Converter</name>
    <version>1.0.0</version>

    <depends>com.intellij.modules.platform</depends>

    <extensions defaultExtensionNs="com.intellij">
        <applicationConfigurable
            parentId="tools"
            instance="com.mermaid.converter.settings.SettingsConfigurable"
            id="com.mermaid.converter.settings"
            displayName="Mermaid Converter" />
    </extensions>

    <actions>
        <action id="MermaidConverter.Convert"
                class="com.mermaid.converter.ConverterAction"
                text="Convert to Draw.io"
                description="Convert Mermaid diagram to Draw.io format">
            <add-to-group group-id="EditorPopupMenu" anchor="last"/>
        </action>
    </actions>
</idea-plugin>
```

#### Kotlin Implementation
```kotlin
// src/main/kotlin/com/mermaid/converter/ConverterAction.kt
package com.mermaid.converter

import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.command.WriteCommandAction
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.vfs.VirtualFileManager
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class ConverterAction : AnAction() {
    override fun actionPerformed(e: AnActionEvent) {
        val project = e.project ?: return
        val editor = e.getData(CommonDataKeys.EDITOR) ?: return
        val document = editor.document
        val file = FileDocumentManager.getInstance().getFile(document) ?: return

        if (!file.name.endsWith(".mmd") && !file.name.endsWith(".mermaid")) {
            return
        }

        val mermaidCode = document.text

        // Run conversion in background
        com.intellij.openapi.progress.ProgressManager.getInstance().run(object : com.intellij.openapi.progress.Task.Backgroundable(project, "Converting Mermaid Diagram") {
            override fun run(indicator: com.intellij.openapi.progress.ProgressIndicator) {
                try {
                    val result = convertMermaid(mermaidCode)
                    val drawioContent = result.getString("content")

                    // Create new file
                    WriteCommandAction.runWriteCommandAction(project) {
                        val newFileName = file.nameWithoutExtension + ".drawio"
                        val newFile = file.parent?.createChildData(this, newFileName)
                        newFile?.setBinaryContent(drawioContent.toByteArray())
                    }

                } catch (ex: Exception) {
                    com.intellij.openapi.ui.Messages.showErrorDialog(
                        project,
                        "Failed to convert diagram: ${ex.message}",
                        "Conversion Error"
                    )
                }
            }
        })
    }

    private fun convertMermaid(mermaidCode: String): JSONObject {
        val settings = Settings.getInstance()
        val apiKey = settings.apiKey ?: throw Exception("API key not configured")

        val client = OkHttpClient()
        val json = JSONObject().apply {
            put("mermaid", mermaidCode)
            put("format", "drawio")
        }

        val requestBody = json.toString().toRequestBody("application/json".toMediaType())

        val request = Request.Builder()
            .url("https://api.mermaid-converter.com/v1/convert")
            .addHeader("Authorization", "Bearer $apiKey")
            .post(requestBody)
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw Exception("API request failed: ${response.code}")
            }

            val responseBody = response.body?.string() ?: throw Exception("Empty response")
            return JSONObject(responseBody).getJSONObject("data")
        }
    }
}
```

## CI/CD Platforms

### GitHub Actions

#### Custom Action
```yaml
# action.yml
name: 'Mermaid to Draw.io Converter'
description: 'Convert Mermaid diagrams to Draw.io format'
inputs:
  api-key:
    description: 'API key for the converter service'
    required: true
  mermaid-files:
    description: 'Glob pattern for Mermaid files'
    required: false
    default: '**/*.mmd'
  output-dir:
    description: 'Output directory for converted files'
    required: false
    default: './converted'
runs:
  using: 'node16'
  main: 'dist/index.js'
```

#### Action Implementation
```javascript
// src/index.js
const core = require('@actions/core');
const github = require('@actions/github');
const glob = require('@actions/glob');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

async function run() {
  try {
    const apiKey = core.getInput('api-key', { required: true });
    const mermaidPattern = core.getInput('mermaid-files') || '**/*.mmd';
    const outputDir = core.getInput('output-dir') || './converted';

    // Create output directory
    await fs.mkdir(outputDir, { recursive: true });

    // Find Mermaid files
    const globber = await glob.create(mermaidPattern);
    const mermaidFiles = await globber.glob();

    core.info(`Found ${mermaidFiles.length} Mermaid files`);

    for (const file of mermaidFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        const relativePath = path.relative(process.cwd(), file);
        const outputPath = path.join(outputDir, relativePath.replace(/\.(mmd|mermaid)$/, '.drawio'));

        core.info(`Converting ${relativePath}`);

        const response = await axios.post('https://api.mermaid-converter.com/v1/convert', {
          mermaid: content,
          format: 'drawio'
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        // Ensure output directory exists
        await fs.mkdir(path.dirname(outputPath), { recursive: true });

        // Write converted file
        await fs.writeFile(outputPath, response.data.data.content);

        core.info(`Converted ${relativePath} -> ${outputPath}`);
      } catch (error) {
        core.error(`Failed to convert ${file}: ${error.message}`);
      }
    }

    // Set output
    core.setOutput('converted-count', mermaidFiles.length);
    core.setOutput('output-dir', outputDir);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
```

#### Usage in Workflow
```yaml
# .github/workflows/convert-diagrams.yml
name: Convert Diagrams

on:
  push:
    paths:
      - 'docs/diagrams/*.mmd'

jobs:
  convert:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Convert Mermaid Diagrams
      uses: your-org/mermaid-converter-action@v1
      with:
        api-key: ${{ secrets.CONVERTER_API_KEY }}
        mermaid-files: 'docs/diagrams/*.mmd'
        output-dir: 'docs/diagrams/converted'

    - name: Commit converted diagrams
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add docs/diagrams/converted/*.drawio
        git commit -m "Convert Mermaid diagrams to Draw.io" || true
        git push
```

### GitLab CI/CD

#### GitLab CI Pipeline
```yaml
# .gitlab-ci.yml
stages:
  - convert
  - deploy

convert_diagrams:
  stage: convert
  image: node:18
  script:
    - npm install -g axios
    - |
      for file in docs/diagrams/*.mmd; do
        if [ -f "$file" ]; then
          filename=$(basename "$file" .mmd)
          echo "Converting $file"

          curl -X POST https://api.mermaid-converter.com/v1/convert \
            -H "Authorization: Bearer $CONVERTER_API_KEY" \
            -H "Content-Type: application/json" \
            -d "{\"mermaid\": \"$(cat "$file")\"}" \
            -o "docs/diagrams/${filename}.drawio"
        fi
      done
  artifacts:
    paths:
      - docs/diagrams/*.drawio
    expire_in: 1 hour
  only:
    changes:
      - docs/diagrams/*.mmd

deploy_docs:
  stage: deploy
  script:
    - echo "Deploying converted diagrams"
  dependencies:
    - convert_diagrams
  only:
    changes:
      - docs/diagrams/*.mmd
```

### Jenkins Pipeline

#### Declarative Pipeline
```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        CONVERTER_API_KEY = credentials('mermaid-converter-api-key')
    }

    stages {
        stage('Convert Diagrams') {
            steps {
                script {
                    def diagramFiles = findFiles(glob: 'docs/diagrams/*.mmd')

                    diagramFiles.each { file ->
                        def filename = file.name.take(file.name.lastIndexOf('.'))
                        def outputFile = "docs/diagrams/${filename}.drawio"

                        sh """
                            curl -X POST https://api.mermaid-converter.com/v1/convert \\
                              -H "Authorization: Bearer \${CONVERTER_API_KEY}" \\
                              -H "Content-Type: application/json" \\
                              -d "{\\"mermaid\\": \\"\\$(cat ${file.path})\\"}" \\
                              -o ${outputFile}
                        """
                    }
                }
            }
        }

        stage('Archive Artifacts') {
            steps {
                archiveArtifacts artifacts: 'docs/diagrams/*.drawio', fingerprint: true
            }
        }
    }

    triggers {
        pollSCM('H/5 * * * *') // Poll every 5 minutes
    }
}
```

## Cloud Platforms

### AWS Lambda

#### Lambda Function
```javascript
// lambda/index.js
const axios = require('axios');

exports.handler = async (event) => {
    const { mermaid, format = 'drawio', theme = 'default' } = JSON.parse(event.body);

    try {
        const response = await axios.post('https://api.mermaid-converter.com/v1/convert', {
            mermaid,
            format,
            theme
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.CONVERTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: true,
                data: response.data.data
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};
```

#### API Gateway Integration
```yaml
# serverless.yml
service: mermaid-converter-lambda

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1

functions:
  convert:
    handler: index.handler
    events:
      - http:
          path: convert
          method: post
          cors: true

environment:
  CONVERTER_API_KEY: ${env:CONVERTER_API_KEY}
```

### Google Cloud Functions

#### Function Implementation
```javascript
// index.js
const axios = require('axios');

exports.convertMermaid = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  const { mermaid, format = 'drawio' } = req.body;

  if (!mermaid) {
    res.status(400).send('Mermaid content is required');
    return;
  }

  try {
    const response = await axios.post('https://api.mermaid-converter.com/v1/convert', {
      mermaid,
      format
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.CONVERTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json({
      success: true,
      data: response.data.data
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

### Vercel Functions

#### API Route
```javascript
// pages/api/convert.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { mermaid, format = 'drawio' } = req.body;

  if (!mermaid) {
    return res.status(400).json({ error: 'Mermaid content is required' });
  }

  try {
    const response = await axios.post('https://api.mermaid-converter.com/v1/convert', {
      mermaid,
      format
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.CONVERTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json({
      success: true,
      data: response.data.data
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
```

## Content Management Systems

### WordPress Plugin

#### Plugin Structure
```
mermaid-converter-wp/
├── mermaid-converter.php
├── includes/
│   ├── class-converter.php
│   ├── class-admin.php
│   └── class-shortcode.php
├── assets/
│   ├── css/
│   └── js/
└── templates/
    └── converter-form.php
```

#### Main Plugin File
```php
<?php
/**
 * Plugin Name: Mermaid to Draw.io Converter
 * Description: Convert Mermaid diagrams to Draw.io format in WordPress
 * Version: 1.0.0
 * Author: Your Name
 */

if (!defined('ABSPATH')) {
    exit;
}

class MermaidConverterWP {
    private $api_key;
    private $api_url = 'https://api.mermaid-converter.com/v1';

    public function __construct() {
        $this->api_key = get_option('mermaid_converter_api_key');

        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_shortcode('mermaid_converter', array($this, 'converter_shortcode'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    public function add_admin_menu() {
        add_options_page(
            'Mermaid Converter',
            'Mermaid Converter',
            'manage_options',
            'mermaid-converter',
            array($this, 'admin_page')
        );
    }

    public function admin_page() {
        if (isset($_POST['submit'])) {
            update_option('mermaid_converter_api_key', sanitize_text_field($_POST['api_key']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }

        $api_key = get_option('mermaid_converter_api_key');
        ?>
        <div class="wrap">
            <h1>Mermaid to Draw.io Converter Settings</h1>
            <form method="post">
                <table class="form-table">
                    <tr>
                        <th scope="row">API Key</th>
                        <td>
                            <input type="password" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text">
                            <p class="description">Get your API key from the converter service</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    public function converter_shortcode($atts) {
        ob_start();
        include plugin_dir_path(__FILE__) . 'templates/converter-form.php';
        return ob_get_clean();
    }

    public function enqueue_scripts() {
        wp_enqueue_script('mermaid-converter', plugin_dir_url(__FILE__) . 'assets/js/converter.js', array('jquery'), '1.0.0', true);
        wp_localize_script('mermaid-converter', 'mermaidConverter', array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('mermaid_converter_nonce')
        ));
    }
}

new MermaidConverterWP();
```

#### AJAX Handler
```php
// includes/class-converter.php
<?php
class MermaidConverter {
    private $api_key;
    private $api_url = 'https://api.mermaid-converter.com/v1';

    public function __construct() {
        $this->api_key = get_option('mermaid_converter_api_key');
        add_action('wp_ajax_convert_mermaid', array($this, 'ajax_convert'));
    }

    public function ajax_convert() {
        check_ajax_referer('mermaid_converter_nonce', 'nonce');

        $mermaid = sanitize_textarea_field($_POST['mermaid']);
        $format = sanitize_text_field($_POST['format'] ?? 'svg');

        if (empty($mermaid)) {
            wp_send_json_error('Mermaid content is required');
            return;
        }

        $response = wp_remote_post($this->api_url . '/convert', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json'
            ),
            'body' => json_encode(array(
                'mermaid' => $mermaid,
                'format' => $format
            )),
            'timeout' => 30
        ));

        if (is_wp_error($response)) {
            wp_send_json_error('API request failed: ' . $response->get_error_message());
            return;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if ($data['success']) {
            wp_send_json_success($data['data']);
        } else {
            wp_send_json_error($data['error']['message']);
        }
    }
}
```

### Drupal Module

#### Module Structure
```
mermaid_converter/
├── mermaid_converter.info.yml
├── mermaid_converter.module
├── src/
│   ├── Controller/
│   │   └── ConverterController.php
│   ├── Form/
│   │   └── SettingsForm.php
│   └── Plugin/
│       └── Block/
│           └── ConverterBlock.php
├── templates/
│   └── converter-form.html.twig
└── js/
    └── converter.js
```

#### Module File
```php
// mermaid_converter.module
<?php

use Drupal\Core\Routing\RouteMatchInterface;

/**
 * @file
 * Mermaid to Draw.io Converter module.
 */

function mermaid_converter_theme() {
  return [
    'mermaid_converter_form' => [
      'variables' => ['form' => NULL],
    ],
  ];
}

function mermaid_converter_menu() {
  $items['mermaid-converter/settings'] = [
    'title' => 'Mermaid Converter Settings',
    'page callback' => 'drupal_get_form',
    'page arguments' => ['mermaid_converter_settings_form'],
    'access arguments' => ['administer site configuration'],
    'type' => MENU_NORMAL_ITEM,
  ];

  return $items;
}
```

#### Controller
```php
// src/Controller/ConverterController.php
<?php

namespace Drupal\mermaid_converter\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use GuzzleHttp\ClientInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class ConverterController extends ControllerBase {
  protected $httpClient;
  protected $apiKey;

  public function __construct(ClientInterface $http_client) {
    $this->httpClient = $http_client;
    $this->apiKey = \Drupal::config('mermaid_converter.settings')->get('api_key');
  }

  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('http_client')
    );
  }

  public function convert(Request $request) {
    $mermaid = $request->request->get('mermaid');
    $format = $request->request->get('format', 'svg');

    if (empty($mermaid)) {
      return new JsonResponse(['error' => 'Mermaid content is required'], 400);
    }

    try {
      $response = $this->httpClient->post('https://api.mermaid-converter.com/v1/convert', [
        'headers' => [
          'Authorization' => 'Bearer ' . $this->apiKey,
          'Content-Type' => 'application/json',
        ],
        'json' => [
          'mermaid' => $mermaid,
          'format' => $format,
        ],
      ]);

      $data = json_decode($response->getBody(), TRUE);

      return new JsonResponse($data);
    } catch (\Exception $e) {
      return new JsonResponse(['error' => $e->getMessage()], 500);
    }
  }
}
```

## Best Practices

### Error Handling
- Implement proper error handling for API failures
- Provide user-friendly error messages
- Log errors for debugging
- Handle rate limiting gracefully

### Security
- Store API keys securely
- Validate user input
- Use HTTPS for all API calls
- Implement proper authentication

### Performance
- Cache converted diagrams when possible
- Use batch operations for multiple diagrams
- Implement lazy loading for large diagrams
- Monitor API usage and response times

### User Experience
- Provide clear feedback during conversion
- Show progress indicators for long operations
- Allow users to preview before converting
- Support drag-and-drop file uploads
