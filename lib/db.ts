import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface DbData {
    users: any[];
    hosts: any[];
    services: any[];
    categories: any[];
    serviceTemplates: any[];
}

class JsonDB {
    private filePath: string;

    constructor() {
        // Use /app/data/db.json in production, or local data/db.json
        const dbUrl = process.env.DATABASE_URL || '';
        let dataDir = dbUrl.replace('file:', '');

        if (!dataDir || dataDir.includes('database.db')) {
            // Default path for the new JSON DB
            dataDir = '/app/data/db.json';
            // If not in docker, use local path
            if (!fs.existsSync('/app/data')) {
                dataDir = path.join(process.cwd(), 'data', 'db.json');
            }
        } else {
            dataDir = dataDir.endsWith('.db') ? dataDir.replace('.db', '.json') : dataDir;
        }

        this.filePath = dataDir;
        console.log('--- DB INITIALIZED ---');
        console.log('DB File Path:', this.filePath);

        // Ensure directory exists
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Initialize file if not exists
        if (!fs.existsSync(this.filePath)) {
            const defaultData: DbData = {
                users: [],
                hosts: [
                    {
                        id: 'example-host-1',
                        name: 'Home Router',
                        ipAddress: '192.168.1.1',
                        description: 'Main Gateway',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ],
                services: [],
                categories: [],
                serviceTemplates: []
            };
            this.save(defaultData);
        }
    }

    private load(): DbData {
        const defaultValue = {
            users: [],
            hosts: [
                {
                    id: 'example-host-1',
                    name: 'Home Router',
                    ipAddress: '192.168.1.1',
                    description: 'Main Gateway',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ],
            services: [],
            categories: [],
            serviceTemplates: []
        };

        try {
            if (!fs.existsSync(this.filePath)) return defaultValue;

            const content = fs.readFileSync(this.filePath, 'utf-8').trim();
            if (!content) {
                // If file is empty, save default and return it
                this.save(defaultValue);
                return defaultValue;
            }

            return JSON.parse(content);
        } catch (error) {
            console.error('Error loading database, resetting to default:', error);
            // On syntax error, try to save default to fix the file
            try { this.save(defaultValue); } catch (e) { }
            return defaultValue;
        }
    }

    private save(data: DbData) {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving database:', error);
        }
    }

    private generateId() {
        return crypto.randomUUID();
    }

    private model(name: keyof DbData) {
        const self = this;
        return {
            count: async (args?: any) => {
                const data = self.load();
                let list = data[name];
                if (args?.where) list = self.filter(list, args.where);
                return list.length;
            },
            findMany: async (args?: any) => {
                const data = self.load();
                let list = [...data[name]];
                if (args?.where) list = self.filter(list, args.where);
                if (args?.orderBy) list = self.sort(list, args.orderBy);
                if (args?.include) list = self.include(data, list, args.include);
                if (args?.select) list = self.applySelect(list, args.select);
                return list;
            },
            findUnique: async (args: any) => {
                const data = self.load();
                const list = data[name];
                const item = list.find((i: any) => self.match(i, args.where));
                if (!item) return null;

                let result = { ...item };
                if (args?.include) result = (self.include(data, [result], args.include))[0];
                if (args?.select) result = (self.applySelect([result], args.select))[0];
                return result;
            },
            findFirst: async (args: any) => {
                const data = self.load();
                let list = data[name];
                if (args?.where) list = self.filter(list, args.where);
                const item = list[0];
                if (!item) return null;

                let result = { ...item };
                if (args?.include) result = (self.include(data, [result], args.include))[0];
                if (args?.select) result = (self.applySelect([result], args.select))[0];
                return result;
            },
            create: async (args: any) => {
                const data = self.load();
                const newItem = {
                    id: self.generateId(),
                    ...args.data,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                data[name].push(newItem);
                self.save(data);
                return newItem;
            },
            update: async (args: any) => {
                const data = self.load();
                const index = data[name].findIndex((i: any) => self.match(i, args.where));
                if (index === -1) throw new Error('Record not found');

                const updatedItem = {
                    ...data[name][index],
                    ...args.data,
                    updatedAt: new Date().toISOString()
                };
                data[name][index] = updatedItem;
                self.save(data);
                return updatedItem;
            },
            delete: async (args: any) => {
                const data = self.load();
                const index = data[name].findIndex((i: any) => self.match(i, args.where));
                if (index === -1) throw new Error('Record not found');
                const deleted = data[name].splice(index, 1)[0];
                self.save(data);
                return deleted;
            }
        };
    }

    private match(item: any, where: any): boolean {
        if (!where) return true;
        return Object.entries(where).every(([k, v]: [string, any]) => {
            if (v && typeof v === 'object' && !Array.isArray(v)) {
                if (v.not !== undefined) return item[k] !== v.not;
                return JSON.stringify(item[k]) === JSON.stringify(v);
            }
            return item[k] === v;
        });
    }

    private filter(list: any[], where: any) {
        return list.filter(item => this.match(item, where));
    }

    private sort(list: any[], orderBy: any) {
        const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
        let sorted = [...list];
        const ordersReversed = [...orders].reverse();
        for (const order of ordersReversed) {
            const [field, dir] = Object.entries(order)[0] as [string, any];
            sorted.sort((a, b) => {
                if (a[field] < b[field]) return dir === 'asc' ? -1 : 1;
                if (a[field] > b[field]) return dir === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sorted;
    }

    private include(fullData: DbData, list: any[], include: any) {
        return list.map(item => {
            const newItem = { ...item };
            if (include.services) {
                newItem.services = fullData.services
                    .filter(s => s.hostId === item.id)
                    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
            }
            if (include.host) {
                newItem.host = fullData.hosts.find(h => h.id === item.hostId);
            }
            return newItem;
        });
    }

    private applySelect(list: any[], select: any) {
        return list.map(item => {
            const newItem: any = {};
            Object.keys(select).forEach(key => {
                if (select[key]) {
                    newItem[key] = item[key];
                }
            });
            return newItem;
        });
    }

    get user() { return this.model('users'); }
    get host() { return this.model('hosts'); }
    get service() { return this.model('services'); }
    get category() { return this.model('categories'); }
    get serviceTemplate() { return this.model('serviceTemplates'); }
}

const prisma = new JsonDB() as any;
export { prisma };
export default prisma;
