import { Resource } from '@opentelemetry/resources';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const resource = new Resource({
  [SEMRESATTRS_SERVICE_NAME]: 'zenbeasts-neon-city',
});

const tracerProvider = new WebTracerProvider({
  resource: resource,
});

const otlpExporter = new OTLPTraceExporter({
  url: import.meta.env.VITE_OTEL_EXPORTER_OTLP_ENDPOINT || 'https://ingest.kubiks.app/v1/traces',
  headers: {
    'x-kubiks-key': import.meta.env.VITE_OTEL_API_KEY || '',
  },
});

tracerProvider.addSpanProcessor(new BatchSpanProcessor(otlpExporter));

registerInstrumentations({
  instrumentations: [
    new FetchInstrumentation({
      requestHook: (span, request) => {
        span.setAttribute('http.request.body', JSON.stringify(request.body));
      },
    }),
    new XMLHttpRequestInstrumentation({
      requestHook: (span, request) => {
        span.setAttribute('http.request.url', request.url);
      },
    }),
  ],
});

tracerProvider.register();

export default tracerProvider;
