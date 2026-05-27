import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { TemplateProps } from '../types';
import { WorkExperience, Education, Skill, Project, Certification, Language, ResumeMeta } from '@/types/resume';

const FONT_SCALE: Record<ResumeMeta['fontSize'], number> = {
  small: 0.88,
  medium: 1.0,
  large: 1.12,
};

function makeStyles(accentColor: string, fontSize: ResumeMeta['fontSize']) {
  const s = FONT_SCALE[fontSize] ?? 1.0;

  return StyleSheet.create({
    page: {
      fontFamily: 'Helvetica',
      fontSize: 9 * s,
      color: '#1a1a1a',
      paddingTop: 36,
      paddingBottom: 36,
      paddingHorizontal: 48,
      lineHeight: 1.4,
    },
    name: {
      fontSize: 22 * s,
      fontWeight: 'bold',
      color: '#111111',
      marginBottom: 4,
    },
    contactRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 2,
      fontSize: 8.5 * s,
      color: '#555',
    },
    contactItem: {
      flexDirection: 'row',
      gap: 2,
    },
    divider: {
      borderBottomWidth: 1.5,
      borderBottomColor: accentColor,
      marginVertical: 8,
    },
    sectionTitle: {
      fontSize: 10 * s,
      fontWeight: 'bold',
      color: accentColor,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: 6,
    },
    section: {
      marginBottom: 10,
    },
    entryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 1,
    },
    entryTitle: {
      fontWeight: 'bold',
      fontSize: 9.5 * s,
    },
    entrySubtitle: {
      fontSize: 9 * s,
      color: '#444',
    },
    entryDate: {
      fontSize: 8.5 * s,
      color: '#666',
    },
    bullet: {
      flexDirection: 'row',
      marginBottom: 2,
      paddingLeft: 8,
    },
    bulletDot: {
      width: 10,
      fontSize: 9 * s,
      color: accentColor,
    },
    bulletText: {
      flex: 1,
      fontSize: 8.5 * s,
      color: '#333',
    },
    summary: {
      fontSize: 8.5 * s,
      color: '#444',
      marginBottom: 8,
      lineHeight: 1.5,
    },
    skillRow: {
      flexDirection: 'row',
      marginBottom: 3,
      flexWrap: 'wrap',
    },
    skillCategory: {
      fontWeight: 'bold',
      fontSize: 8.5 * s,
      width: 90,
      color: '#333',
    },
    skillItems: {
      flex: 1,
      fontSize: 8.5 * s,
      color: '#444',
    },
    projectName: {
      fontWeight: 'bold',
      fontSize: 9.5 * s,
    },
    projectMeta: {
      fontSize: 8.5 * s,
      color: '#555',
      marginBottom: 1,
    },
    certRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 4,
    },
    certName: {
      fontWeight: 'bold',
      fontSize: 9 * s,
    },
    certIssuer: {
      fontSize: 8.5 * s,
      color: '#555',
    },
    certDate: {
      fontSize: 8.5 * s,
      color: '#666',
    },
    langRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 3,
    },
    langName: {
      fontSize: 9 * s,
      fontWeight: 'bold',
      color: '#222',
    },
    langProficiency: {
      fontSize: 8.5 * s,
      color: '#555',
    },
  });
}

function formatDate(date: string | null, current: boolean): string {
  if (current) return 'Present';
  if (!date) return '';
  const [year, month] = date.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

export function ClassicTemplate({ data }: TemplateProps) {
  const { personal, experience, education, skills, projects, certifications, languages, sections, meta } = data;
  const styles = makeStyles(meta.accentColor, meta.fontSize ?? 'medium');

  const orderedVisible = [...sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.name}>{personal.fullName || 'Your Name'}</Text>
        <View style={styles.contactRow}>
          {personal.email && <Text style={styles.contactItem}>{personal.email}</Text>}
          {personal.phone && <Text style={styles.contactItem}>{personal.phone}</Text>}
          {personal.location && <Text style={styles.contactItem}>{personal.location}</Text>}
          {personal.linkedin && <Text style={styles.contactItem}>{personal.linkedin}</Text>}
          {personal.github && <Text style={styles.contactItem}>{personal.github}</Text>}
          {personal.website && <Text style={styles.contactItem}>{personal.website}</Text>}
        </View>

        {personal.summary && (
          <>
            <View style={styles.divider} />
            <Text style={styles.summary}>{personal.summary}</Text>
          </>
        )}

        {/* Sections in user-defined order */}
        {orderedVisible.map((sec) => {
          if (sec.id === 'personal') return null;

          if (sec.id === 'experience' && experience.length > 0) {
            return (
              <View key={sec.id} style={styles.section}>
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Experience</Text>
                {experience.map((exp: WorkExperience) => (
                  <View key={exp.id} style={{ marginBottom: 7 }}>
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
                        <Text style={styles.bulletDot}>•</Text>
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
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Education</Text>
                {education.map((edu: Education) => (
                  <View key={edu.id} style={{ marginBottom: 5 }}>
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
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Skills</Text>
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
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Projects</Text>
                {projects.map((proj: Project) => (
                  <View key={proj.id} style={{ marginBottom: 7 }}>
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
                        <Text style={styles.bulletDot}>•</Text>
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
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Certifications</Text>
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
                <View style={styles.divider} />
                <Text style={styles.sectionTitle}>Languages</Text>
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
