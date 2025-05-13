import { Button } from '../components/button'
import { Heading } from '../components/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/table'

// Dummy data for now
const repos = [
  {
    id: 1,
    name: 'bskit',
    path: '/Users/orca/Code/bskit',
  },
  {
    id: 2,
    name: 'catalyst',
    path: '/Users/orca/Code/catalyst',
  },
  {
    id: 3,
    name: 'titan',
    path: '/Users/orca/Code/titan',
  },
]

export default function Repos() {
  return (
    <>
      <div className="flex items-end justify-between gap-4">
        <Heading>Repositories</Heading>
        <Button className="-my-0.5">Add Repository</Button>
      </div>
      <Table className="mt-8 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Repository</TableHeader>
            <TableHeader>Path</TableHeader>
            <TableHeader className="text-right">Actions</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {repos.map((repo) => (
            <TableRow key={repo.id}>
              <TableCell className="font-medium">{repo.name}</TableCell>
              <TableCell className="text-zinc-500">{repo.path}</TableCell>
              <TableCell className="text-right">
                <Button color="light">
                  Clone
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  )
}