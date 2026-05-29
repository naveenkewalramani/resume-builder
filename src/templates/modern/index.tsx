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
      paddingTop: 0,
      paddingBottom: 0,
      paddingHorizontal: 0,
    },
    layout: {
      flexDirection: 'row',
      height: '100%',
    },
    leftColumn: {
      width: '33%',
      backgroundColor: accentColor,
      padding: 20 * s,
    },
    rightColumn: {
      width: '67%',
      backgroundColor: '#ffffff',
      paddingLeft: 24 * s,
      paddingRight: 20 * s,
      paddingTop: 20 * s,
      paddingBottom: 20 * s,
    },
    // Left column styles
    leftName: {
      fontSize: 18 * s,
      color: '#ffffff',
      fontFamily: 'Helvetica-Bold',
      marginBottom: 12 * s,
    },
    leftContactItem: {
      fontSize: 8 * s,
      color: '#ffffffcc',
      marginBottom: 2 * s,
    },
    leftContactBlock: {
      marginTop: 4 * s,
      marginBottom: 8 * s,
    },
    leftSectionTitle: {
      fontSize: 7 * s,
      color: '#ffffffaa',
      fontFamily: 'Helvetica-Bold',
      marginTop: 12 * s,
      marginBottom: 4 * s,
    },
    leftSkillItem: {
      fontSize: 8 * s,
      color: '#ffffff',
      marginBottom: 1 * s,
    },
    leftLangRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2 * s,
    },
    leftLangName: {
      fontSize: 8 * s,
      color: '#ffffff',
    },
    leftLangProficiency: {
      fontSize: 8 * s,
      color: '#ffffffcc',
    },
    // Right column styles
    rightSectionTitle: {
      fontSize: 9 * s,
      fontFamily: 'Helvetica-Bold',
      color: accentColor,
      borderBottomWidth: 0.5,
      borderBottomColor: accentColor,
      paddingBottom: 2 * s,
      marginTop: 12 * s,
      marginBottom: 6 * s,
    },
    summary: {
      fontSize: 8.5 * s,
      color: '#444444',
      lineHeight: 1.5,
      marginBottom: 4 * s,
    },
    section: {
      marginBottom: 4 * s,
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
      color: '#111111',
    },
    entrySubtitle: {
      fontSize: 9 * s,
      color: '#444444',
      marginBottom: 2 * s,
    },
    entryDate: {
      fontSize: 8.5 * s,
      color: '#666666',
    },
    bullet: {
      flexDirection: 'row',
      marginBottom: 2 * s,
      paddingLeft: 8 * s,
    },
    bulletDot: {
      width: 10 * s,
      fontSize: 9 * s,
      color: accentColor,
    },
    bulletText: {
      flex: 1,
      fontSize: 8.5 * s,
      color: '#333333',
      lineHeight: 1.4,
    },
    entryBlock: {
      marginBottom: 7 * s,
    },
    skillCategory: {
      fontFamily: 'Helvetica-Bold',
      fontSize: 8.5 * s,
      color: '#333333',
      marginBottom: 1 * s,
    },
    skillItems: {
      fontSize: 8.5 * s,
      color: '#444444',
      marginBottom: 3 * s,
    },
    projectName: {
      fontFamily: 'Helvetica-Bold',
      fontSize: 9.5 * s,
      color: '#111111',
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
      color: '#111111',
    },
    certIssuer: {
      fontSize: 8.5 * s,
      color: '#555555',
    },
    certDate: {
      fontSize: 8.5 * s,
      color: '#666666',
    },
  });
}

export function ModernTemplate({ data }: TemplateProps) {
  const { personal, experience, education, skills, projects, certifications, languages, sections, meta } = data;
  const styles = makeStyles(meta.accentColor, meta.fontSize ?? 'medium');

  const orderedVisible = [...sections]
    .filter((sec) => sec.visible)
    .sort((a, b) => a.order - b.order);

  const isVisible = (id: string) => orderedVisible.some((sec) => sec.id === id);

  // Contact info items for left column
  const contactItems = [
    personal.email,
    personal.phone,
    personal.location,
    personal.website,
    personal.linkedin,
    personal.github,
  ].filter(Boolean) as string[];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.layout}>
          {/* Left column */}
          <View style={styles.leftColumn}>
            <Text style={styles.leftName}>{personal.fullName || 'Your Name'}</Text>
            <View style={styles.leftContactBlock}>
              {contactItems.map((item, i) => (
                <Text key={i} style={styles.leftContactItem}>{item}</Text>
              ))}
            </View>

            {isVisible('skills') && skills.length > 0 && (
              <View>
                <Text style={styles.leftSectionTitle}>{'SKILLS'}</Text>
                {skills.map((sk: Skill) => (
                  <View key={sk.id}>
                    <Text style={[styles.leftSkillItem, { fontFamily: 'Helvetica-Bold' }]}>{sk.category}</Text>
                    <Text style={[styles.leftSkillItem, { marginBottom: 3 * (FONT_SCALE[meta.fontSize ?? 'medium'] ?? 1.0) }]}>
                      {sk.items.join(', ')}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {isVisible('languages') && languages.length > 0 && (
              <View>
                <Text style={styles.leftSectionTitle}>{'LANGUAGES'}</Text>
                {languages.map((lang: Language) => (
                  <View key={lang.id} style={styles.leftLangRow}>
                    <Text style={styles.leftLangName}>{lang.language}</Text>
                    <Text style={styles.leftLangProficiency}>{lang.proficiency}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Right column */}
          <View style={styles.rightColumn}>
            {personal.summary && isVisible('personal') && (
              <View>
                <Text style={styles.rightSectionTitle}>{'SUMMARY'}</Text>
                <Text style={styles.summary}>{personal.summary}</Text>
              </View>
            )}

            {orderedVisible.map((sec) => {
              if (sec.id === 'personal' || sec.id === 'skills' || sec.id === 'languages') return null;

              if (sec.id === 'experience' && experience.length > 0) {
                return (
                  <View key={sec.id} style={styles.section}>
                    <Text style={styles.rightSectionTitle}>{'EXPERIENCE'}</Text>
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
                    <Text style={styles.rightSectionTitle}>{'EDUCATION'}</Text>
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

              if (sec.id === 'projects' && projects.length > 0) {
                return (
                  <View key={sec.id} style={styles.section}>
                    <Text style={styles.rightSectionTitle}>{'PROJECTS'}</Text>
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
                    <Text style={styles.rightSectionTitle}>{'CERTIFICATIONS'}</Text>
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

              return null;
            })}
          </View>
        </View>
      </Page>
    </Document>
  );
}
