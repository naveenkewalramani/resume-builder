import React from 'react';
import { pdf, DocumentProps } from '@react-pdf/renderer';
import { TemplateProps } from '@/templates/types';

export async function downloadPdf(
  Component: React.FC<TemplateProps>,
  data: TemplateProps['data']
) {
  const element = React.createElement(Component, { data }) as unknown as React.ReactElement<DocumentProps>;
  const blob = await pdf(element).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.meta.title.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
