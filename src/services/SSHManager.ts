import { NodeSSH } from 'node-ssh';

export class SSHManager {
  private connections: Map<string, NodeSSH> = new Map();
  
  public getAllConnections() {
    return Array.from(this.connections.keys());
  }

  public async connect({ id, host, username, password, privateKey }: { id?: string, host: string, username: string, password?: string, privateKey?: string }) {
    if(!id) id = crypto.randomUUID();
    if (this.connections.has(id)) throw new Error("Connection already exists");

    const ssh = new NodeSSH();

    await ssh.connect({
      host,
      username,
      password,
      privateKey
    });

    this.connections.set(id, ssh);

    return id;
  }

  public disconnect(id: string) {
    const ssh = this.connections.get(id);
    if (ssh && ssh.isConnected()) ssh.dispose();

    this.connections.delete(id);
  }

  public getConnection(id: string) {
    return this.connections.get(id);
  }

  public getConnections() {
    return this.connections;
  }

  public async executeCommand(id: string, command: string) {
    const ssh = this.connections.get(id);
    if (ssh) return await ssh.execCommand(command);
  }
}
