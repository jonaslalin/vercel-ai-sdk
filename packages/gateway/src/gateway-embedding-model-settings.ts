export type GatewayEmbeddingModelId =
  | 'amazon/titan-embed-text-v2'
  | 'cohere/embed-english-light-v3.0'
  | 'cohere/embed-english-v3.0'
  | 'cohere/embed-multilingual-light-v3.0'
  | 'cohere/embed-multilingual-v3.0'
  | 'cohere/embed-v4.0'
  | 'google/gemini-embedding-001'
  | 'google/text-embedding-005'
  | 'google/text-multilingual-embedding-002'
  | 'mistral/codestral-embed'
  | 'mistral/mistral-embed'
  | 'openai/text-embedding-3-large'
  | 'openai/text-embedding-3-small'
  | 'openai/text-embedding-ada-002'
  | (string & {});
