import systemInformation from 'systeminformation';

export const getSystemSpecs = async (req, res) => {
    try {
        const specs = await systemInformation.get({
            cpu: 'manufacturer, brand',
            mem: 'total',
            osInfo: 'distro',
            networkInterfaces: 'default, ip4'
        });
        res.json(specs);
    } catch (error) {
        res.status(500).json({ error: 'Could not retrieve system specs' });
    }
};