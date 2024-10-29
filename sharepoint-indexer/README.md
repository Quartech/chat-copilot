# SharePoint Indexer

This project implements a SharePoint indexer that uses Azure Cognitive Search to extract, split, and index large documents from a SharePoint site. Each document is divided into chunks, with vector embeddings generated for each chunk to enable granular and efficient search and retrieval.

## Prerequisites
This documentation assumes you have gone through the documentation for shaepoint indexer linked on the main README page. I am linking that document here again for reference. The two main documents you need to read are:

[Shrepoint Indexer](https://learn.microsoft.com/en-us/azure/search/search-howto-index-sharepoint-online)

[Index Projections](https://learn.microsoft.com/en-us/azure/search/search-how-to-define-index-projections?tabs=rest-create-index%2Crest-create-index-projection)

You also need to have Postman or any other tool you prefer to be able to make API calls. Also, Ensure your Azure resources and registered apps have necessary permissions to access the sharepoint data. This is done in the main sharepoint documentation. This documentation will focus on my implementation of the sharepoint indexer so combined with the main documentation, you should be able to get everything setup.

## Some Additional Information
My registered app is in the Quartech Lab tenant because our sharepoint site is in the Quartech Lab tenant. You need to reach out to IT regarding necessary permissions. My app is named 'quartech-copilot-sharepoint' in app registrations in Microsoft Entra ID.

## Create a Datasource
The following is the body of the request I used to create the datasource. The connection string uses the Qgpt sharepoint site quartech has setup in the Quartech Lab Tenant. Note I created the Entra ID app in the same tenant as the sharepoint site. You need to replace the ApplicationId, ApplicationSecret, and TenantId with your own.
```
POST https://searchs-ncus-qsl-openai-001.search.windows.net/datasources?api-version=2024-05-01-preview 
Content-Type: application/json
api-key: [admin key]

{
    "name" : "sharepoint-datasource-5",
    "type" : "sharepoint",
    "credentials" : { "connectionString" : "SharePointOnlineEndpoint=https://quartechsystems.sharepoint.com/sites/Q-gpt;ApplicationId=[];ApplicationSecret=[];TenantId=[]" },
    "container" : { "name" : "defaultSiteLibrary", "query" : null }
}
```

### Create an Index
This section is important to understand the index projections. For my implementation, I only used one index. After all, we only need one index to store all our embeddings but it is a bit tricky. When we run the indexer with the appropriate skillsets, the first skill that we use is the Text Split skill which chunks out our documents into smaller chunks. Then when we create embeddings using the Azure Embedding Skill, when we use this skill, it creates embeddings for each chunk in each document. Keep this in mind while we look at the body of the request I used to create my index. You can use any fields you want. This is just an example of how I set up my index. The index needs to be creatd before the indexer or the skillset.

```
  POST https://searchs-ncus-qsl-openai-001.search.windows.net/indexes?api-version=2024-05-01-preview
  Content-Type: application/json
  api-key: [admin key]

{
    "name" : "sharepoint-index-child",
    "fields": [
      {"name": "chunk_id","type": "Edm.String","searchable": true,"filterable": true"retrievable": true,"stored": true,"sortable": true,"facetable": true,"key": true,"analyzer": "keyword"
    },
    {"name": "document_id","type": "Edm.String","searchable": true,"filterable": true,"retrievable": true,"stored": true,"sortable": true,"facetable": true,"key": false
    },
    {"name": "metadata_spo_item_name","type": "Edm.String","searchable": true,"filterable": false,"retrievable": true,"stored": true,"sortable": false,"facetable": false,"key": false
    },
    {"name": "content","type": "Edm.String","searchable": true,"filterable": false,"retrievable": true,"stored": true,"sortable": false,"facetable": false,"key": false
    },
    {
      "name": "vector",
      "type": "Collection(Edm.Single)",
      "searchable": true,
      "filterable": false,
      "retrievable": true,
      "stored": true,
      "sortable": false,
      "facetable": false,
      "key": false,
      "indexAnalyzer": null,
      "searchAnalyzer": null,
      "analyzer": null,
      "normalizer": null,
      "dimensions": 1536,
      "vectorSearchProfile": "contentVector_profile",
      "vectorEncoding": null,
      "synonymMaps": []
    }
  ],
    "semantic": {
    "defaultConfiguration": null,
    "configurations": [
      {
        "name": "azureml-default",
        "prioritizedFields" : {
            "prioritizedContentFields": [
            {
              "fieldName": "content"
            }
          ],
          "prioritizedKeywordsFields": []
        }
        }
    ]
  },
  "vectorSearch": {
    "algorithms": [
      {
        "name": "contentVector_config",
        "kind": "hnsw",
        "hnswParameters": {
          "metric": "cosine",
          "m": 4,
          "efConstruction": 400,
          "efSearch": 500
        },
        "exhaustiveKnnParameters": null
      }
    ],
    "profiles": [
      {
        "name": "contentVector_profile",
        "algorithm": "contentVector_config",
        "vectorizer": null,
        "compression": null
      }
    ],
    "vectorizers": [],
    "compressions": []
  }
}
```
Now remember how I mentioned that the skill creates embeddings for each chunk in each document? We store these embeddings in the 'contentVector' field. This is why we have to define a vector search profile and a vector search configuration. But notice that contentVector is a collection of (Edm.Single). But if our skill is creating embeddings for each chunk in a document, the resulting vector would be a collection of collections which would be hard to map. This is why we have to use index projections. After we get the result from the embedding skill, we treat each chunk as its own document and create its embedding and put it back into the same index we created here. If we didn't do this projection, we would be trying to fit a collection of embeddings in each index in the contentVector array which would not work. You need to read the define index projection document I linked above to uderstand this better. In my implementation, my parent and child index are the same. What I mean by that is if you notice the target index in the indexer configuration, its the same as the index in the projection in our skillset configuration. This means that we used one index to extract data from the sharepoint site, used the skills and created embeddings for each chunk and stored them as indivdiual documents in the same index. But in the documentation, you will see that you can have separate parent and child indexes in instances where we want to keep the original documents and have the chunks. Please do whatever is best for your use case accordingly. 

## Create a Skillset
The following is the body of the request I used to create the skillset. Notice that the target index name in the projection is the same as the index in the indexer. I am using two skills here. The first skill is the split skill which chunks out the documents into smaller chunks. The second skill is the embedding skill which creates embeddings for each chunk. The embeddings are stored in the vector field. The index projections tell the skillset how to take the output from the embedding skill and map it back into the index. Remember how I said that we don't need to any output field mappings in the indexer, its because we are doing the mappings in the skillset call below. Notice we need to do mappings for all the fields that is not the key field of the index and the parentkeyfieldname. Everything else needs to be mapped to the apprpriate field. You might also notice the attribute parameters.projectionMode is set to skipindexingparentdocuments. This is because we are not indexing the parent documents. We are just using the parent key field to map the embeddings back to the parent document. So if we didn't set this, we would have the original documents itself plus the chunks as individual documents in the index. For example, if five documents contribute 100 chunks to the index, then the number of documents in the index is 105. The five documents created or parent fields have nulls for child fields, making them substantially different from the bulk of the documents in the index.
```
POST https://searchs-ncus-qsl-openai-001.search.windows.net/skillsets?api-version=2024-07-01
Content-Type: application/json

{
    "name": "skillset-with-projection",
    "skills": [
        {
            "@odata.type": "#Microsoft.Skills.Text.SplitSkill",
            "description": "Splits large text into chunks.",
            "textSplitMode": "pages",
            "maximumPageLength": 20000,
            "pageOverlapLength": 5000,
            "defaultLanguageCode": "en",
            "inputs": [
                {
                    "name": "text",
                    "source": "/document/content"
                }
            ],
            "outputs": [
                {
                    "name": "textItems",
                    "targetName": "pages"
                }
            ]
        },
        {
            "@odata.type": "#Microsoft.Skills.Text.AzureOpenAIEmbeddingSkill",
            "description": "Generate embeddings from SharePoint content",
            "resourceUri": "https://ncus-qsl-openai-poc.openai.azure.com/",
            "apiKey": "",
            "context":"/document/pages/*",
            "deploymentId": "text-embedding-ada-002",
            "modelName": "text-embedding-ada-002",
            "dimensions": 1536,
            "inputs": [
                {
                    "name": "text",
                    "source": "/document/pages/*" 
                }
            ],
            "outputs": [
                {
                    "name": "embedding",
                    "targetName": "vector"
                }
            ]
        }
    ],
    "cognitiveServices": null,
    "knowledgeStore": null,
    "indexProjections": {
    "selectors": [
      {
        "targetIndexName": "sharepoint-index-child",
        "parentKeyFieldName": "document_id",
        "sourceContext": "/document/pages/*",
        "mappings": [
          {
            "name": "content",
            "source": "/document/pages/*",
            "sourceContext": null,
            "inputs": []
          },
          {
            "name": "vector",
            "source": "/document/pages/*/vector",
            "sourceContext": null,
            "inputs": []
          },
          {
            "name": "metadata_spo_item_name",
            "source": "/document/metadata_spo_item_name",
            "sourceContext": null,
            "inputs": []
          }
        ]
      }
    ],
    "parameters": {
        "projectionMode": "skipIndexingParentDocuments"
    }
  },
  "encryptionKey": null
}
```

## Create an Indexer
The following is the body of the request I used to create the indexer. Notice that the target index name is the same as the index we created above. Also, there's no outfield mappings done because we are projecting our embeddings back into the same index so we do those mappins in the skillset configuration. I did do the mapping to fill the chunk_id which is the key field. The datasource name is the name of the datasource we created above. The skillset name is the name of the skillset we created below.
```
{
  POST https://searchs-ncus-qsl-openai-001.search.windows.net/indexers?api-version=2024-05-01-preview
  Content-Type: application/json
  api-key: [admin key]

{
    "name" : "sharepoint-indexer-projection",
    "dataSourceName" : "sharepoint-datasource-5",
    "skillsetName": "skillset-with-projection",
    "targetIndexName" : "sharepoint-index-child",
    "parameters": {
    "batchSize": null,
    "maxFailedItems": null,
    "maxFailedItemsPerBatch": null,
    "base64EncodeKeys": null,
    "configuration": {
        "indexedFileNameExtensions" : ".pdf, .docx",
        "excludedFileNameExtensions" : ".png, .jpg",
        "dataToExtract": "contentAndMetadata"
      }
    },
    "schedule" : { },
    "fieldMappings" : [
        { 
          "sourceFieldName" : "metadata_spo_site_library_item_id", 
          "targetFieldName" : "chunk_id", 
          "mappingFunction" : { 
            "name" : "base64Encode" 
          }
         }
    ],
    "outputFieldMappings": [
    ]
}
```
## Checking the Indexer Status
You can use the following request to check the status of the indexer. I prefer to just go on Azure and check whether the indexer is running or not.
```
GET https://searchs-ncus-qsl-openai-001.search.windows.net/indexers/sharepoint-indexer/status?api-version=2024-05-01-preview
Content-Type: application/json
api-key: [admin key]
```

This is the end of the sharepoint indexer documentation. The two documents linked at the beginning combined with this documentation should be enough to get you started. If you have any questions, feel free to reach out to the dev team and they will direct you to the right person.