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
      fontFamily: 'Times-Roman',
      fontSize: 10 * s,
      color: '#111111',
      paddingTop: 42,
      paddingBottom: 42,
      paddingHorizontal: 50,
      lineHeight: 1.3,
    },
    // ── Header ──────────────────────────────────────────────────
    name: {
      fontFamily: 'Times-Bold',
      fontSize: 22 * s,
      color: accentColor,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 2,
      marginBottom: 10,
    },
    contactRow: {
      fontFamily: 'Times-Roman',
      fontSize: 9.5 * s,
      color: '#111111',
      textAlign: 'center',
      marginBottom: 8,
    },
    // ── Section ──────────────────────────────────────────────────
    sectionTitle: {
      fontFamily: 'Times-Bold',
      fontSize: 10.5 * s,
      color: '#111111',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginTop: 10,
      marginBottom: 2,
    },
    divider: {
      borderBottomWidth: 0.75,
      borderBottomColor: '#111111',
      marginBottom: 5,
    },
    // ── Summary ──────────────────────────────────────────────────
    summary: {
      fontFamily: 'Times-Roman',
      fontSize: 9.5 * s,
      lineHeight: 1.45,
      marginBottom: 2,
    },
    // ── Entry rows ───────────────────────────────────────────────
    entryContainer: {
      marginBottom: 7,
    },
    entryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    entryTitle: {
      fontFamily: 'Times-Bold',
      fontSize: 10 * s,
    },
    entryDate: {
      fontFamily: 'Times-Italic',
      fontSize: 9.5 * s,
    },
    entrySubRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 2,
    },
    entrySubtitle: {
      fontFamily: 'Times-Roman',
      fontSize: 9.5 * s,
    },
    // ── Bullets ──────────────────────────────────────────────────
    bulletRow: {
      flexDirection: 'row',
      marginTop: 2,
      paddingLeft: 8,
    },
    bulletDash: {
      width: 13,
      fontFamily: 'Times-Roman',
      fontSize: 9.5 * s,
    },
    bulletText: {
      flex: 1,
      fontFamily: 'Times-Roman',
      fontSize: 9.5 * s,
      lineHeight: 1.35,
    },
    // ── Skills ───────────────────────────────────────────────────
    skillRow: {
      flexDirection: 'row',
      marginBottom: 3,
      alignItems: 'baseline',
    },
    skillCategory: {
      fontFamily: 'Times-Bold',
      fontSize: 9.5 * s,
      width: 100,
    },
    skillItems: {
      flex: 1,
      fontFamily: 'Times-Roman',
      fontSize: 9.5 * s,
    },
    // ── Projects ─────────────────────────────────────────────────
    projectContainer: {
      marginBottom: 7,
    },
    projectName: {
      fontFamily: 'Times-Bold',
      fontSize: 10 * s,
    },
    projectMeta: {
      fontFamily: 'Times-Italic',
      fontSize: 9.5 * s,
      marginBottom: 1,
    },
    projectDesc: {
      fontFamily: 'Times-Roman',
      fontSize: 9.5 * s,
      marginBottom: 1,
    },
    // ── Certifications ───────────────────────────────────────────
    certRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 4,
    },
    certLeft: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    certName: {
      fontFamily: 'Times-Bold',
      fontSize: 9.5 * s,
    },
    certIssuer: {
      fontFamily: 'Times-Roman',
      fontSize: 9.5 * s,
    },
    certDate: {
      fontFamily: 'Times-Italic',
      fontSize: 9.5 * s,
    },
    // ── Languages ────────────────────────────────────────────────
    langRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 3,
    },
    langName: {
      fontFamily: 'Times-Bold',
      fontSize: 9.5 * s,
    },
    langProficiency: {
      fontFamily: 'Times-Italic',
      fontSize: 9.5 * s,
    },
  });
}

export function ClassicTemplate({ data }: TemplateProps) {
  const { personal, experience, education, skills, projects, certifications, languages, sections, meta } = data;
  const styles = makeStyles(meta.accentColor, meta.fontSize ?? 'medium');

  const orderedVisible = [...sections]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const contactParts = [
    personal.email,
    personal.phone,
    personal.location,
    personal.linkedin,
    personal.github,
    personal.website,
  ].filter(Boolean);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── Header ── */}
        <Text style={styles.name}>{personal.fullName || 'Your Name'}</Text>
        {contactParts.length > 0 && (
          <Text style={styles.contactRow}>{contactParts.join(' | ')}</Text>
        )}

        {/* ── Summary (rendered before sections loop) ── */}
        {personal.summary && (
          <View>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.divider} />
            <Text style={styles.summary}>{personal.summary}</Text>
          </View>
        )}

        {/* ── Ordered Sections ── */}
        {orderedVisible.map((sec) => {
          if (sec.id === 'personal') return null;

          if (sec.id === 'experience' && experience.length > 0) {
            return (
              <View key={sec.id}>
                <Text style={styles.sectionTitle}>Work Experience</Text>
                <View style={styles.divider} />
                {experience.map((exp: WorkExperience) => (
                  <View key={exp.id} style={styles.entryContainer}>
                    <View style={styles.entryRow}>
                      <Text style={styles.entryTitle}>{exp.title || 'Title'}</Text>
                      <Text style={styles.entryDate}>
                        {formatDate(exp.startDate, false)}{exp.startDate || exp.endDate ? ' – ' : ''}{formatDate(exp.endDate, exp.current)}
                      </Text>
                    </View>
                    <View style={styles.entrySubRow}>
                      <Text style={styles.entrySubtitle}>{exp.company}</Text>
                      {exp.location ? (
                        <Text style={styles.entrySubtitle}>{exp.location}</Text>
                      ) : null}
                    </View>
                    {exp.bullets.filter(Boolean).map((b, i) => (
                      <View key={i} style={styles.bulletRow}>
                        <Text style={styles.bulletDash}>{'−'}</Text>
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
              <View key={sec.id}>
                <Text style={styles.sectionTitle}>Education</Text>
                <View style={styles.divider} />
                {education.map((edu: Education) => (
                  <View key={edu.id} style={styles.entryContainer}>
                    <View style={styles.entryRow}>
                      <Text style={styles.entryTitle}>{edu.institution || 'Institution'}</Text>
                      <Text style={styles.entryDate}>
                        {formatDate(edu.startDate, false)}{edu.startDate || edu.endDate ? ' – ' : ''}{formatDate(edu.endDate, edu.current)}
                      </Text>
                    </View>
                    <View style={styles.entrySubRow}>
                      <Text style={styles.entrySubtitle}>
                        {[edu.degree, edu.field ? `in ${edu.field}` : null, edu.gpa ? `GPA: ${edu.gpa}` : null]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            );
          }

          if (sec.id === 'skills' && skills.length > 0) {
            return (
              <View key={sec.id}>
                <Text style={styles.sectionTitle}>Skills</Text>
                <View style={styles.divider} />
                {skills.map((sk: Skill) => (
                  <View key={sk.id} style={styles.skillRow}>
                    <Text style={styles.skillCategory}>{sk.category}:</Text>
                    <Text style={styles.skillItems}>{sk.items.join(', ')}</Text>
                  </View>
                ))}
              </View>
            );
          }

          if (sec.id === 'projects' && projects.length > 0) {
            return (
              <View key={sec.id}>
                <Text style={styles.sectionTitle}>Projects</Text>
                <View style={styles.divider} />
                {projects.map((proj: Project) => (
                  <View key={proj.id} style={styles.projectContainer}>
                    <View style={styles.entryRow}>
                      <Text style={styles.projectName}>{proj.name || 'Project'}</Text>
                      {proj.url ? <Text style={styles.entryDate}>{proj.url}</Text> : null}
                    </View>
                    {proj.description ? (
                      <Text style={styles.projectDesc}>{proj.description}</Text>
                    ) : null}
                    {proj.technologies.length > 0 ? (
                      <Text style={styles.projectMeta}>{proj.technologies.join(' · ')}</Text>
                    ) : null}
                    {proj.bullets.filter(Boolean).map((b, i) => (
                      <View key={i} style={styles.bulletRow}>
                        <Text style={styles.bulletDash}>{'−'}</Text>
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
              <View key={sec.id}>
                <Text style={styles.sectionTitle}>Certifications</Text>
                <View style={styles.divider} />
                {certifications.map((cert: Certification) => (
                  <View key={cert.id} style={styles.certRow}>
                    <View style={styles.certLeft}>
                      <Text style={styles.certName}>{cert.name || 'Certification'}</Text>
                      {cert.issuer ? (
                        <Text style={styles.certIssuer}>{' | '}{cert.issuer}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.certDate}>{cert.date}</Text>
                  </View>
                ))}
              </View>
            );
          }

          if (sec.id === 'languages' && languages.length > 0) {
            return (
              <View key={sec.id}>
                <Text style={styles.sectionTitle}>Languages</Text>
                <View style={styles.divider} />
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
