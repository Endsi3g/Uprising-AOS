'use client'

import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
  },
  header: {
    marginBottom: 30,
    borderBottom: '1 solid #E4E4E7',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#09090B',
  },
  subtitle: {
    fontSize: 14,
    color: '#71717A',
    marginTop: 5,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    color: '#3F3F46',
    lineHeight: 1.5,
  }
})

// Create Document Component
export const ClientReportDoc = ({ client, deliverables }: { client: any, deliverables: any[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Rapport Uprising Studio</Text>
        <Text style={styles.subtitle}>Client: {client?.name || 'Inconnu'}</Text>
        <Text style={styles.subtitle}>Date: {new Date().toLocaleDateString()}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Livrables Récents</Text>
        {deliverables && deliverables.length > 0 ? deliverables.map((d: any, i: number) => (
          <Text key={i} style={styles.text}>• {d.title} ({d.status}) - Progress: {d.progress}%</Text>
        )) : (
          <Text style={styles.text}>Aucun livrable en cours.</Text>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.heading}>Notes & Prochaines Étapes</Text>
        <Text style={styles.text}>
          Généré automatiquement par l'Uprising Agency OS.
        </Text>
      </View>
    </Page>
  </Document>
)

export function DownloadReportButton({ client, deliverables }: { client: any, deliverables: any[] }) {
  // @react-pdf/renderer is heavy, but we render it dynamically here
  return (
    <PDFDownloadLink
      document={<ClientReportDoc client={client} deliverables={deliverables} />}
      fileName={`rapport-${client?.name?.toLowerCase().replace(/\s+/g, '-') || 'client'}-${new Date().toISOString().split('T')[0]}.pdf`}
    >
      {({ blob, url, loading, error }) => (
        <Button variant="outline" size="sm" disabled={loading} className="gap-2">
          <Download className="h-4 w-4" />
          {loading ? 'Génération...' : 'Télécharger le PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
