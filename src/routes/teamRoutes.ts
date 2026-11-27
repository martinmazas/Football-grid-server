import express from 'express';
const teamRoutes = express.Router();
import teamController from '../Controllers/teamsController';
import playerController from '../Controllers/playerController';
import { requireAdmin } from '../middleware/adminAuth';

teamRoutes.get('/', teamController.getTeams);
teamRoutes.post('/newTeam', requireAdmin, teamController.addTeam);
teamRoutes.delete('/', requireAdmin, teamController.removeTeam, playerController​​.deletePlayerByTeam);
teamRoutes.put('/tournament', requireAdmin, teamController.removeTournamentFromTeam);

export { teamRoutes };