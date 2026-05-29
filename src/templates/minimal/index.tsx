import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { TemplateProps } from '../types';
import { WorkExperience, Education, Skill, Project, Certification, Language, ResumeMeta } from '@/types/resume';

const FONT_SCALE: Record<ResumeMeta['fontSize'], number> = {
  small: 0.88,
  medium: 1.0,
  large: 1.12,
};

function formatDate(date: string | null, current: boolean): string {
  if (current) return 'Present';
  if (!date) return '';
  const [year, month] = date.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

function makeStyles(accentColor: string, fontSize: ResumeMeta['fontSize']) {
  const s = FONT_SCALE[fontSize] ?? 1.0;

  return StyleSheet.create({
    page: {
      fontFamily: 'Helvetica',
      fontSize: 9 * s,
      color: '#333333',
      paddingTop: 54,
      paddingBottom: 54,
      paddingLeft: 60,
      paddingRight: 60,
      lineHeight: 1.5,
    },
    name: {
      fontSize: 22 * s,
      textAlign: 'center',
      color: accentColor,
      fontFamily: 'Helvetica',
      marginBottom: 10 * s,
    },
    contactRow: {
      fontSize: 8.5 * s,
      color: '#666666',
      textAlign: 'center',
      marginBottom: 16 * s,
    },
    sectionTitle: {
      fontSize: 8 * s,
      color: accentColor,
      fontFamily: 'Helvetica-Bold',
      marginTop: 14 * s,
      marginBottom: 6 * s,
    },
    section: {
      marginBottom: 2 * s,
    },
    entryBlock: {
      marginBottom: 7 * s,
    },
    entryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 1 * s,
    },
    entryTitle: {
      fontFamily: 'Helvetica-Bold',
      fontSize: 9.5 * s,
      color: '#222222',
    },
    entrySubtitle: {
      fontSize: 9 * s,
      color: '#444444',
      lineHeight: 1.5,
      marginBottom: 2 * s,
    },
    entryDate: {
      fontSize: 8.5 * s,
      color: '#666666',
    },
    bullet: {
      borderLeftWidth: 1.5,
      borderLeftColor: accentColor,
      paddingLeft: 5 * s,
      marginBottom: 2 * s,
    },
    bulletText: {
      fontSize: 9 * s,
      color: '#333333',
      lineHeight: 1.6,
    },
    summary: {
      fontSize: 9 * s,
      color: '#444444',
      lineHeight: 1.6,
      marginBottom: 4 * s,
    },
    skillRow: {
      flexDirection: 'row',
      marginBottom: 3 * s,
      flexWrap: 'wrap',
    },
    skillCategory: {
      fontFamily: 'Helvetica-Bold',
      fontSize: 8.5 * s,
      width: 90,
      color: '#333333',
    },
    skillItems: {
      flex: 1,
      fontSize: 8.5 * s,
      color: '#444444',
      lineHeight: 1.5,
    },
    projectName: {
      fontFamily: 'Helvetica-Bold',
      fontSize: 9.5 * s,
      color: '#222222',
    },
    projectMeta: {
      fontSize: 8.5 * s,
      color: '#555555',
      marginBottom: 1 * s,
    },
    certRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 4 * s,
    },
    certName: {
      fontFamily: 'Helvetica-Bold',
      fontSize: 9 * s,
      color: '#222222',
    },
    certIssuer: {
      fontSize: 8.5 * s,
      color: '#555555',
    },
    certDate: {
      fontSize: 8.5 * s,
      color: '#666666',
    },
    langRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 3 * s,
    },
    langName: {
      fontSize: 9 * s,
      fontFamily: 'Helvetica-Bold',
      color: '#222222',
    },
    langProficiency: {
      fontSize: 8.5 * s,
      color: '#555555',
    },
  });
}

export function MinimalTemplate({ data }: TemplateProps) {
  const { personal, experience, education, skills, projects, certifications, languages, sections, meta } = data;
  const styles = makeStyles(meta.accentColor, meta.fontSize ?? 'medium');

  const orderedVisible = [...sections]
    .filter((sec) => sec.visible)
    .sort((a, b) => a.order - b.order);

  // Build contact row string
  const contactParts = [
    personal.email,
    personal.phone,
    personal.location,
    personal.website,
    personal.linkedin,
    personal.github,
  ].filter(Boolean) as string[];

  const contactLine = contactParts.join(' · ');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.name}>{personal.fullName || 'Your Name'}</Text>
        {contactLine.length > 0 && (
          <Text style={styles.contactRow}>{contactLine}</Text>
        )}

        {/* Summary — rendered at top if personal section is visible and summary exists */}
        {personal.summary && orderedVisible.some((s) => s.id === 'personal') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{'SUMMARY'}</Text>
            <Text style={styles.summary}>{personal.summary}</Text>
          </View>
        )}

        {/* Sections in user-defined order */}
        {orderedVisible.map((sec) => {
          if (sec.id === 'personal') return null;

          if (sec.id === 'experience' && experience.length > 0) {
            return (
              <View key={sec.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{'EXPERIENCE'}</Text>
                {experience.map((exp: WorkExperience) => (
                  <View key={exp.id} style={styles.entryBlock}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.entryTitle}>{exp.title || 'Title'}</Text>
                      <Text style={styles.entryDate}>
                        {formatDate(exp.startDate, false)} – {formatDate(exp.endDate, exp.current)}
                      </Text>
                    </View>
                    <Text style={styles.entrySubtitle}>
                      {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                    </Text>
                    {exp.bullets.filter(Boolean).map((b, i) => (
                      <View key={i} style={styles.bullet}>
                        <Text style={styles.bulletText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            );
          }

          if (sec.id === 'education' && education.length > 0) {
            return (
              <View key={sec.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{'EDUCATION'}</Text>
                {education.map((edu: Education) => (
                  <View key={edu.id} style={styles.entryBlock}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.entryTitle}>{edu.institution || 'Institution'}</Text>
                      <Text style={styles.entryDate}>
                        {formatDate(edu.startDate, false)} – {formatDate(edu.endDate, edu.current)}
                      </Text>
                    </View>
                    <Text style={styles.entrySubtitle}>
                      {edu.degree} in {edu.field}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            );
          }

          if (sec.id === 'skills' && skills.length > 0) {
            return (
              <View key={sec.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{'SKILLS'}</Text>
                {skills.map((sk: Skill) => (
                  <View key={sk.id} style={styles.skillRow}>
                    <Text style={styles.skillCategory}>{sk.category}</Text>
                    <Text style={styles.skillItems}>{sk.items.join(', ')}</Text>
                  </View>
                ))}
              </View>
            );
          }

          if (sec.id === 'projects' && projects.length > 0) {
            return (
              <View key={sec.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{'PROJECTS'}</Text>
                {projects.map((proj: Project) => (
                  <View key={proj.id} style={styles.entryBlock}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.projectName}>{proj.name || 'Project'}</Text>
                      {proj.url ? <Text style={styles.entryDate}>{proj.url}</Text> : null}
                    </View>
                    {proj.description ? (
                      <Text style={styles.entrySubtitle}>{proj.description}</Text>
                    ) : null}
                    {proj.technologies.length > 0 ? (
                      <Text style={styles.projectMeta}>{proj.technologies.join(' · ')}</Text>
                    ) : null}
                    {proj.bullets.filter(Boolean).map((b, i) => (
                      <View key={i} style={styles.bullet}>
                        <Text style={styles.bulletText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            );
          }

          if (sec.id === 'certifications' && certifications.length > 0) {
            return (
              <View key={sec.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{'CERTIFICATIONS'}</Text>
                {certifications.map((cert: Certification) => (
                  <View key={cert.id} style={styles.certRow}>
                    <View>
                      <Text style={styles.certName}>{cert.name || 'Certification'}</Text>
                      <Text style={styles.certIssuer}>{cert.issuer}</Text>
                    </View>
                    <Text style={styles.certDate}>{cert.date}</Text>
                  </View>
                ))}
              </View>
            );
          }

          if (sec.id === 'languages' && languages.length > 0) {
            return (
              <View key={sec.id} style={styles.section}>
                <Text style={styles.sectionTitle}>{'LANGUAGES'}</Text>
                {languages.map((lang: Language) => (
                  <View key={lang.id} style={styles.langRow}>
                    <Text style={styles.langName}>{lang.language}</Text>
                    <Text style={styles.langProficiency}>{lang.proficiency}</Text>
                  </View>
                ))}
              </View>
            );
          }

          return null;
        })}
      </Page>
    </Document>
  );
}
