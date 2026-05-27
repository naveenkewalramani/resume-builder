'use client';

import { PDFViewer } from '@react-pdf/renderer';
import { TemplateProps } from '@/templates/types';
import React from 'react';

interface Props extends TemplateProps {
  component: React.FC<TemplateProps>;
}

export function PdfPreview({ component: Template, data }: Props) {
  return (
    <PDFViewer width="100%" height="100%" showToolbar={false}>
      <Template data={data} />
    </PDFViewer>
  );
}
