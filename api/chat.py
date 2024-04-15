from elasticsearch_client import (
    get_elasticsearch_chat_message_history,
)
from elasticsearch import Elasticsearch
from flask import render_template, stream_with_context, current_app
import json
import os
from openai import AzureOpenAI

ES_USER= os.getenv("ES_USER")
ES_PASS= os.getenv("ES_PASS")
ES_CLOUDID= os.getenv("ES_CLOUDID")
INDEX = os.getenv("ES_INDEX")
INDEX_CHAT_HISTORY = os.getenv("ES_INDEX_CHAT_HISTORY")
ELSER_MODEL = os.getenv("ELSER_MODEL")

SESSION_ID_TAG = "[SESSION_ID]"
SOURCE_TAG = "[SOURCE]"
DONE_TAG = "[DONE]"

OPENAI_VERSION=os.getenv("OPENAI_VERSION")
OPENAI_BASE_URL=os.getenv("OPENAI_BASE_URL")
OPENAI_API_KEY=os.getenv("OPENAI_API_KEY")
OPENAI_ENGINE=os.getenv("OPENAI_ENGINE")

source_fields = ["title", "headings", "url", "meta_keywords", "article_content", "meta_description", "last_crawled_at", "inner_hits"]

es = Elasticsearch(cloud_id=ES_CLOUDID, basic_auth=(ES_USER, ES_PASS))

@stream_with_context
def ask_question(question, session_id):
    yield f"data: {SESSION_ID_TAG} {session_id}\n\n"
    current_app.logger.debug("Chat session ID: %s", session_id)

    chat_history = get_elasticsearch_chat_message_history(
        INDEX_CHAT_HISTORY, session_id
    )

    text_expand_query = {
    "nested": {
      "path": "passages",
      "query": {
        "text_expansion": {
          "passages.vector.predicted_value": {
            "model_id": ".elser_model_2_linux-x86_64",
            "model_text": question
          }
        }
      },
      "inner_hits": {
        "_source": "false",
        "fields": [
          "passages.text"
        ]
      }
    }
  }
    
    current_app.logger.debug("Index: %s", INDEX)
    docs = es.search(index=INDEX, source=source_fields, query=text_expand_query)

    for doc in docs["hits"]["hits"]:
        metadata_object = {
                "name": doc["_source"]["title"],
                "summary": doc["_source"]["meta_description"],
                "url": doc["_source"]["url"],
                "category": "cna",
                "updated_at": doc["_source"]["last_crawled_at"]
        }

        for inner_doc in doc["inner_hits"]["passages"]["hits"]["hits"]:
            doc_source = {**metadata_object, "page_content": inner_doc['fields']['passages'][0]['text'][0]}
            yield f"data: {SOURCE_TAG} {json.dumps(doc_source)}\n\n"

    qa_prompt = render_template(
        "./rag_prompt.txt",
        question=question,
        docs=docs["hits"]["hits"],
        chat_history=chat_history.messages,
    )

    current_app.logger.debug("QA from: %s", qa_prompt)


    client = AzureOpenAI(
    api_key=OPENAI_API_KEY,  
    api_version=OPENAI_VERSION,
    azure_endpoint = OPENAI_BASE_URL
    )

    answer = ""
    answer = client.chat.completions.create(
        model=OPENAI_ENGINE,
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": qa_prompt},
        ]
    )
    answer = answer.choices[0].message.content;
    answer = answer.replace("\\", "\\\\").replace("\n", "</p><p>")

    yield f"data: {answer}\n\n"
    yield f"data: {DONE_TAG}\n\n"
    current_app.logger.debug("Answer: %s", answer)

    chat_history.add_user_message(question)
    chat_history.add_ai_message(answer)
