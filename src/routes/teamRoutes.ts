import express from 'express';
const teamRoutes = express.Router();
import teamController from '../Controllers/teamsController';
import playerController from '../Controllers/playerController';

teamRoutes.get('/', teamController.getTeams);
teamRoutes.post('/newTeam', teamController.addTeam);
teamRoutes.delete('/', teamController.removeTeam, playerController​​.deletePlayerByTeam);
teamRoutes.put('/tournament', teamController.removeTournamentFromTeam);

export { teamRoutes };